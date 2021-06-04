const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

const steamFriendsUrl = 'http://api.steampowered.com/ISteamUser/GetFriendList/v0001/';
const steamGamesUrl = 'http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/'
// TODO: Convert this into git secret. DO NOT push this file to repo with a value populated. For now just put in your API Key manually to see it work.
const steamAPIKey = '';

app.get('/api/getSteamFriends', (req, res) => {
    if(req.query.steamID) {
        fetch(`${steamFriendsUrl}?key=${steamAPIKey}&steamid=${req.query.steamID}`)
            .then(resp => resp.json())
            .then(data => res.send(data))
            .catch(err => res.status(500).json({status: err}));
    }
    else {
        res.status(500).json({status: "Missing Param"});
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
        res.status(500).json({status: "Missing Param"});
    }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});