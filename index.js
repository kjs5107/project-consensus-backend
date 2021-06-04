const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

const steamFriendsUrl = 'http://api.steampowered.com/ISteamUser/GetFriendList/v0001/';
const steamPlayerSummaryUrl = 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/'
const steamPlayerSummaryMaxSteamIDs = 100;
const steamGamesUrl = 'http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/'
// TODO: Convert this into git secret. DO NOT push this file to repo with a value populated. For now just put in your API Key manually to see it work.
const steamAPIKey = '';

app.get('/api/getSteamFriends', (req, res) => {
    if(req.query.steamID) {
        let promises = [];
        fetch(`${steamFriendsUrl}?key=${steamAPIKey}&steamid=${req.query.steamID}`)
            .then(resp => resp.json())
            .then(data => {
                const friendsList = data?.friendslist?.friends ?? [];

                // If user has more than steamPlayerSummaryMaxSteamIDs friends, we need to separate into multiple calls.
                let steamIDsCsvArr = [];
                let counter = 0;
                while(counter < friendsList.length) {
                    let csvStr = '';
                    for(let i = counter; i < friendsList.length && i < counter + steamPlayerSummaryMaxSteamIDs; i++) {
                        csvStr += friendsList[i].steamid + ',';
                    }
                    csvStr = csvStr.replace(/,(?=\s*$)/, ''); // remove trailing comma
                    steamIDsCsvArr.push(csvStr);
                    counter += steamPlayerSummaryMaxSteamIDs;
                }

                // Now we can make the call(s) to the Player Summary Url
                steamIDsCsvArr.forEach(steamIDsCsv => {
                    console.log(`Making fetch call to: ${steamPlayerSummaryUrl}?key=${steamAPIKey}&steamids=${steamIDsCsv}`)
                    promises.push(fetch(`${steamPlayerSummaryUrl}?key=${steamAPIKey}&steamids=${steamIDsCsv}`).then(resp => resp.json()));
                });

                // Now resolve all the promises and send it on over to the client
                if(promises.length > 0) {
                    Promise.all(promises)
                        .then(data => res.send(data));
                }
                else {
                    res.status(500).json({status: "Bad Steam Promises"});
                }
            })
            .catch(err => res.status(500).json({status: err}));
    }
    else {
        res.status(500).json({status: "Missing Steam Param"});
    }
});

app.get('/api/getSteamOwnedGames', (req, res) => {
    if(req.query.steamID) {
        fetch(`${steamGamesUrl}?key=${steamAPIKey}&steamid=${req.query.steamID}&include_appinfo=true`)
            .then(resp => resp.json())
            .then(data => res.send(data))
            .catch(err => res.status(500).json({status: err}));
    }
    else {
        res.status(500).json({status: "Missing Steam Param"});
    }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});