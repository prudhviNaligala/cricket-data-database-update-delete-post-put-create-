const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

//get cricket api

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectTOResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//get cricket api

app.get("/players/", async (request, response) => {
  const { player_id } = request.params;
  const getPlayerQuery = `SELECT * FROM
    cricket_team
    ORDER BY 
    player_id`;
  const playerArray = await db.all(getPlayerQuery);
  response.send(
    playerArray.map((eachPlayer) => convertDbObjectTOResponseObject(eachPlayer))
  );
});

//create a player api

app.post("/players/", async (request, response) => {
  const player_details = request.body;
  const { playerName, jerseyNumber, role } = player_details;
  const addPlayerQuery = `INSERT INTO cricket_team
  (player_name,jersey_number,role)
  VALUES('${playerName}','${jerseyNumber}','${role}');`;
  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.player_id;
  response.send("Player Added to Team");
});

//get playerId

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM cricket_team 
    WHERE player_id = ${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbObjectTOResponseObject(player));
});

//update player details

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `UPDATE cricket_team 
  SET 
  player_name='${playerName}',
  jersey_number = '${jerseyNumber}',
  role='${role}'
  WHERE player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayersQuery = `DELETE FROM cricket_team
    WHERE player_id = ${playerId};`;
  await db.run(deletePlayersQuery);
  response.send("Player Removed");
});

module.exports = app;
