# fitbot

fitbot posts Strava activity to Slack.

![http://i.imgur.com/2yvGuyL.jpg](http://i.imgur.com/2yvGuyL.jpg)

## Fork of fitbot that uses a whitelist instead of a blocklist

This is a fork of fitbot with one change. Instead of specifying a blocklist to prevent certain users from having their activities post, there is a whitelist to specify which users should have their activities posted. You must specify the Strava user first name and last initial for every user that wants their activities posted. See below for a config example.

## Installation

1. fitbot is a NodeJS module. You'll need to install that first. More information can be found [here](https://nodejs.org/en/download/package-manager/).
2. Next, check out the fitbot code. `git clone git@github.com:pifantastic/fitbot.git`
3. Install dependencies. `cd fitbot && npm install`
4. Run fitbot. I use a tool called `pm2`. You can find more information about it [here](https://github.com/Unitech/pm2).
  1. `npm install pm2 -g`
  2. `pm2 start index.js`

## Configuration

Start by copying the provided sample configuration:

```
cp config.sample.json config.json
```

Next, update the configuration for your purposes. Here are what the various options mean:

### `activity_check_interval` (Default: 60000)
This is how often fitbot will check Strava for new activity, measured in milliseconds. You probably don't want to use too small of a number, or else you'll run into Strava API rate limits.

### `strava_clubs` (Default: [])
This is an array of the Strava clubs in which to look for activities, and the corresponding
webhook needed to post them to Slack. Here is an example of the format:

```json
[
  {
    "id": 12345,
    "webhook": "https://hooks.slack.com/services/XXXXX/XXXXXX/XXXXXXXXXXX",
    "whitelist": ["Bob T.", "Jane S."]
  }
]
```

`id` is the ID of the Strava club. This can be a bit challenging to figure out. A simple way to find it is to go to the webpage for the Strava club, and then click the `Club Leaderboard` link. You'll be taken to a new webapge whose URL contains the club's ID. For
example: `https://www.strava.com/clubs/123456`.

`webhook` is a Slack incoming webhook. You can find more information on how to set these up [here](https://api.slack.com/incoming-webhooks).

`whitelist` is a list of athlete names (First name and last initial) that should have their activities posted to Slack.

### `strava_token` (Default: "")
This is a Strava API token. You can get one of these by creating a new Strava API application. More information on how to do that can be found [here](https://www.strava.com/settings/api)

*NOTE*: The user who created the Strava API application needs to be a member of
all of the clubs configured in `strava_clubs` for fitbot to work!

### `slack_name` (Default: "fitbot")
This is the name fitbot will use when posting activites to Slack.

### `slack_icon` (Default: "http://i.imgur.com/2E6yJjV.png")
This is the icon that fitbot will use when posting activities to Slack.

## FAQ

1. Why does fitbot display athlete names with a `.` after the first letter?

> This prevents fitbot from alerting users when it posts to Slack.

## Changelog

### `1.3.0`
Strava made changes to their API so they don't give as much data on the API
calls. This required a change to this bot. First, they don't show the timestamp
of the activities, so we can't check if data is stale. This shouldn't be a big
deal as the first time the script starts, it doesn't post old activities, but
instead puts them in the db so we know not to ever post them. Strava also
doesn't return the activity ID or athlete IDs. This means that we can't link to
the activity within the post. Also, to determine activities that already have
been posted, we have to go off the activity name + distance, which should be
unique except in very rare instances.

### `1.2.0`
`blocklist` option added for athletes who wish to be a part of a club but do not wish to have their activities posted to Slack.

### `1.1.0`

fitbot maintains a list of activities to prevent reposting activities it has already posted. Historically that list has been kept in
memory. This, however, means fitbit did not persist across restarts/crashes, causing it to occasionally bomb slack with lots of activities
that had already been posted. Version `1.1.0` uses a file-backed database to maintain the list of activities to avoid this.

### `1.0.0`

Initial release.

## License

    Copyright (c) 2016, Aaron Forsander

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted, provided that the above
    copyright notice and this permission notice appear in all copies.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
    WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
    MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
    SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
    WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
    OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
    CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
