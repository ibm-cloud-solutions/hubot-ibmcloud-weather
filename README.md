# hubot-ibmcloud-weather

A hubot script for obtaining weather information using IBM Cloud Weather Insights.

## Getting Started
* [Usage](#usage)
* [Commands](#commands)
* [Hubot Adapter Setup](#hubot-adapter-setup)
* [Development](#development)
* [License](#license)
* [Contribute](#contribute)

## Usage <a id="usage"></a>

Steps for adding this to your existing hubot:

1. `cd` into your hubot directory
2. Install the TWC functionality with `npm install hubot-ibmcloud-weather --save`
3. Add `hubot-ibmcloud-weather` to your `external-scripts.json`
4. Add the necessary environment variables:
```
HUBOT_TWC_API=<Insights for Weather API>
HUBOT_TWC_USER=<Insights for Weather User>
HUBOT_TWC_PASSWORD=<Insights for Weather Password>
HUBOT_ALCHEMY_API=<Watson Alchemy API>
HUBOT_ALCHEMY_APIKEY=<Watson Alchemy API Key>
HUBOT_WATSON_RE_API=<Watson Relationship Extraction API>
HUBOT_WATSON_RE_USER=<Watson Relationship Extraction User>
HUBOT_WATSON_RE_PASSWORD=<Watson Relationship Extraction Password>
```
_Note_: Relationship extraction is optional.
5. Start up your bot & off to the races!

## Commands <a id="commands"></a>

- `hubot weather help` - Show available commands in the weather category.
- `hubot weather for [LOCATION]` - Obtains weather information for a location based on the service selected; defaults to current weather.
- `hubot weather services` - View and select the weather information of interest: current, 24 hour forecast, 24 hour weather observations, 10-day forecast.

## Hubot Adapter Setup <a id="hubot-adapter-setup"></a>

Hubot supports a variety of adapters to connect to popular chat clients.  For more feature rich experiences you can setup the following adapters:
- [Slack setup](./docs/adapters/slack.md)
- [Facebook Messenger setup](./docs/adapters/facebook.md)


## Development <a id="development"></a>

Please refer to the [CONTRIBUTING.md](./CONTRIBUTING.md) before starting any work.  Steps for running this script for development purposes:

### Configuration Setup

1. Create `config` folder in root of this project.
2. Create `env` in the `config` folder, with the following contents:
```
export HUBOT_TWC_API=<Weather Insights API>
export HUBOT_TWC_USER=<Weather Insights User>
export HUBOT_TWC_PASSWORD=<Weather Insights Password>
export HUBOT_ALCHEMY_API=<Watson Alchemy API>
export HUBOT_ALCHEMY_APIKEY=<Watson Alchemy API Key>
export HUBOT_WATSON_RE_API=<Watson Relationship Extraction API>
export HUBOT_WATSON_RE_USER=<Watson Relationship Extraction User>
export HUBOT_WATSON_RE_PASSWORD=<Watson Relationship Extraction Password>
```
_Note_: Relationship extraction is optional.
3. In order to view content in chat clients you will need to add `hubot-ibmcloud-formatter` to your `external-scripts.json` file. Additionally, if you want to use `hubot-help` to make sure your command documentation is correct:
4. Create `external-scripts.json` in the root of this project, with the following contents:
```
[
	"hubot-help",
	"hubot-ibmcloud-formatter"
]
```
5. Lastly, run `npm install` to obtain all the dependent node modules.

### Running Hubot with Adapters

Hubot supports a variety of adapters to connect to popular chat clients.

If you just want to use:
 - Terminal: run `npm run start`
 - [Slack: link to setup instructions](docs/adapters/slack.md)
 - [Facebook Messenger: link to setup instructions](docs/adapters/facebook.md)

## License <a id="license"></a>

See [LICENSE.txt](./LICENSE.txt) for license information.

## Contribute <a id="contribute"></a>

Please check out our [Contribution Guidelines](./CONTRIBUTING.md) for detailed information on how you can lend a hand.
