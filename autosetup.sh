#!/bin/bash

echo -n "Owner ID: "
read owner
clear
echo -n "Bot token: "
read token
clear
echo -n "Bot ID: "
read clientid
clear
echo -n "Gemini api key: "
read apikey
clear
echo -n "OpenAI api key: "
read openaikey
clear
echo -n "Errors webhook link: "
read errorswebhookURL
clear
echo -n "Info webhook link: "
read infowebhookurl
clear

if [ -z "$owner" ]; then 
  owner="OWNER_ID"
fi
if [ -z "$token" ]; then 
  token="BOT_TOKEN"
fi
if [ -z "$clientid" ]; then 
  clientid="BOT_ID"
fi
if [ -z "$apikey" ]; then 
  apikey="GEMINI_API_KEY"
fi
if [ -z "$openaikey" ]; then 
  openaikey="OPENAI_API_KEY"
fi
if [ -z "$errorswebhookURL" ]; then 
  errorswebhookURL="WEBHOOK_URL_FOR_BOT_ERRORS"
fi
if [ -z "$infowebhookurl" ]; then 
  infowebhookurl="WEBHOOK_URL_FOR_BOT_INFO"
fi

echo Editing config.json...
cd src
cat >config.json << EOF
{
    "owners": [
        "$owner"
    ],
    "token": "$token",
    "clientid": "$clientid",
    "apikey": "$apikey",
    "openaikey": "$openaikey",
    "errorswebhookURL": "$errorswebhookURL",
    "infowebhookurl": "$infowebhookurl"
}
EOF
cd ..
echo Successfully generated config.json.
sleep 2
clear
echo Installing yarn...
sudo npm i -g yarn > /dev/null
echo Successfully installed yarn.
sleep 2
clear
echo Running yarn install...
yarn install
echo Successfully installed dependencies.
echo -n "Do you want to run the bot now? (y/N): "
read run
runBot=0
if [ "$run" == "Y" ]; then
   runBot=1
fi
if [ "$run" == "y" ]; then
   runBot=1
fi
clear
if [ "$runBot" == "1" ]; then
   yarn run start
else
   echo Setup complete.
fi
