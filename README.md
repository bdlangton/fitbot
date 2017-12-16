# fitbot

fitbot posts Strava activity to Slack.

![http://i.imgur.com/2yvGuyL.jpg](http://i.imgur.com/2yvGuyL.jpg)

## Fork of fitbot that includes athletes by ID rather than using Strava clubs

This is a fork of fitbot with one minor change. Instead of loading activities from clubs, and therefore requiring athletes to be in the club, you specify a list of athlete IDs to get activities from.

NOTE: If you are interested in a fork that still uses the Strava clubs, but uses an athlete whitelist instead of blacklist, check out the branch `club-whitelist` on my fork.

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

### `athletes` (Default: [])
This is an array of the Strava athlete IDs in which to look for activities, and the corresponding
webhook needed to post them to Slack. Here is an example of the format:

```json
"athletes": [
  12345,
  123456
],
```

### `webhook` is a Slack incoming webhook. You can find more information on how to set these up [here](https://api.slack.com/incoming-webhooks).

Example format:

```json
"webhook": "https://hooks.slack.com/services/XXXX/XXXX/XXXX",
```

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
