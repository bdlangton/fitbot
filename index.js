#!/usr/bin/env nodejs

const util = require('util');
const strava = require('strava-v3');
const _ = require('lodash');
const request = require('request');

const logger = require('./lib/logger');
const db = require('./lib/db');
const config = require('./lib/config');

const VERBS = {
  'Ride': 'rode',
  'Run': 'ran',
  'Swim': 'swam',
  'AlpineSki': 'downhill skied',
  'BackcountrySki': 'backcountry skied',
  'Canoeing': 'canoed',
  'Crossfit': 'did a CrossFit WOD',
  'EBikeRide': 'rode an e-bike',
  'Elliptical': 'used an elliptical',
  'Handcycle': 'handcycled',
  'Hike': 'hiked',
  'IceSkate': 'ice skated',
  'InlineSkate': 'inline skated',
  'Kayaking': 'kayaked',
  'Kitesurf': 'kite surfed',
  'NordicSki': 'nordic skied',
  'RockClimbing': 'rock climbed',
  'RollerSki': 'roller skied',
  'Rowing': 'rowed',
  'Snowboard': 'snowboarded',
  'Snowshoe': 'snowshoed',
  'StairStepper': 'stair stepped',
  'StandUpPaddling': 'SUPed',
  'Surfing': 'surfed',
  'VirtualRide': 'virtually rode',
  'Walk': 'walked',
  'WeightTraining': 'lifted weights',
  'Wheelchair': 'wheelchaired',
  'Windsurf': 'wind surfed',
  'Workout': 'did a workout',
  'Yoga': 'did some yoga'
};

const EMOJI = {
  'Ride': ':bicyclist:',
  'Run': ':runner:',
  'Swim': ':swimmer:',
  'AlpineSki': ':skier:',
  'BackcountrySki': ':skier:',
  'Canoeing': ':rowboat:',
  'Crossfit': ':weight_lifter:',
  'EBikeRide': ':bike:',
  'Elliptical': ':runner:',
  'Handcycle': '',
  'Hike': ':walking:',
  'IceSkate': ':ice_skate:',
  'InlineSkate': ':ice_skate:',
  'Kayaking': ':rowboat:',
  'Kitesurf': ':ocean:',
  'NordicSki': ':ski:',
  'RockClimbing': '',
  'RollerSki': ':ice_skate:',
  'Rowing': ':rowboat:',
  'Snowboard': ':snowboarder:',
  'Snowshoe': ':snowflake:',
  'StandUpPaddling': ':ocean:',
  'StairStepper': '',
  'Surfing': ':surfer:',
  'VirtualRide': ':bike:',
  'Walk': ':walking:',
  'WeightTraining': ':weight_lifter:',
  'Wheelchair': ':wheelchair:',
  'Windsurf': ':sailboat:',
  'Workout': ':weight_lifter:',
  'Yoga': ''
};

function filterActivities(activities) {
  return activities.filter(function(activity) {
    // Filter out activities we've already seen.
    const isNew = !db.get('activities').find({id: activity.id}).value();

    // Filter out activities that are more than 7 days old.
    const SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7;
    const isStale = (new Date(activity.start_date).getTime()) <= (new Date().getTime() - SEVEN_DAYS);

    return isNew && !isStale;
  });
}

function checkForNewActivities(initial) {
  initial = !!initial

  config.athletes.forEach(function(athlete) {
    // Get activities from the athlete.
    strava.athlete.listActivities({
      access_token: config.strava_token,
      per_page: 200,
      id: athlete,
    }, function(error, activities) {
      if (error) {
        return logger.error('Error listing activities', { error: error, athlete: athlete});
      }

      if (!activities || !activities.length) {
        return logger.info('No activities found', { response: activities, athlete: athlete});
      }

      const newActivities = filterActivities(activities);

      logger.info('Checked for activities', {
        count: newActivities.length,
        athlete: athlete,
        initial: initial
      });

      // On the initial pass we just want to populate the database but not post
      // any activities. This makes it safe to start fitbot without bombing a
      // channel with messages.
      if (!initial) {
        newActivities.forEach(function(activity) {

          // Get athlete details.
          strava.athlete.get({
            access_token: config.strava_token,
            id: activity.athlete.id
          }, function(error, athlete) {
            if (error) {
              return logger.error('Error fetching athlete details', { error: error, athlete: athlete});
            }

            postActivityToSlack(config.webhook, athlete, activity);
          });
        });
      }

      newActivities.forEach(function(activity) {
        db.get('activities').push({id: activity.id}).write();
      });
    });
  });
};

function postActivityToSlack(webhook, athlete, activity) {
  var message = formatActivity(athlete, activity);

  request.post({
    url: webhook,
    method: 'POST',
    json: true,
    body: {
      username: config.slack_name,
      icon_url: config.slack_icon,
      text: message,
    },
  }, function(error) {
    if (error) {
      return logger.error('Error posting message to Slack', {
        webhook: webhook,
        error: error,
        activity: activity,
      });
    }

    logger.info(util.format('Posted to slack: %s', message));
  });
}

function formatActivity(athlete, activity) {
  const emoji = EMOJI[activity.type] || '';
  const who = util.format('%s %s', dingProtect(athlete.firstname), dingProtect(athlete.lastname));
  const link = util.format('<https://www.strava.com/activities/%d>', activity.id);
  const distance = Math.round((activity.distance * 0.00062137) * 100) / 100; // Convert to miles /o\
  const verb = VERBS[activity.type] || activity.type;

  const message = '%s %s %d miles! %s %s %s %s';
  return util.format(message, who, verb, distance, emoji, activity.name, emoji, link);
}

function dingProtect(string) {
  if (string && string.length > 1) {
    return string[0] + '.' + string.substring(1);
  }
  return string;
}

checkForNewActivities(true);

setInterval(checkForNewActivities, config.activity_check_interval);
