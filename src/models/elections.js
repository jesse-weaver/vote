
import sqlite3 from 'sqlite3';
import path from 'path';
import { head, forEach } from 'lodash';

console.log('getting sqlite3 client verbose');
const sqlite3Client = sqlite3.verbose();

let dbPath = path.resolve(__dirname, '../../data/elections');
console.log(dbPath);
const db = new sqlite3Client.Database(dbPath);

export function createElection(details) {

}

/**
* Returns an election and all related metadata
*/
export function getElection(electionId, cb) {
  electionId = 1;
  let electionData = {};
  db.serialize(function() {
    db.all(`
    SELECT
      election.id as electionId,
      election.name as electionName,
      election.description as electionDescription,
      start_time,
      end_time,
      evo.voter_options_id,
      vo.id as optionId,
      vo.name as optionName,
      vo.description as optionDescription
    FROM election
    LEFT JOIN election_voter_options evo ON evo.election_id = election.id
    LEFT JOIN voter_options vo ON vo.id = evo.voter_options_id
    `, function(err, results) {
      if (err) {
        cb(null, { error: err });
      }

      if (results) {
        const firstRow = head(results);
        console.log('firstRow', firstRow);
        electionData = {
          id: firstRow.electionId,
          name: firstRow.electionName,
          description: firstRow.electionDescription,
          start_time: firstRow.start_time,
          end_time: firstRow.end_time,
          options: []
        };

        forEach(results, function(row) {
          console.log('option', row);
          electionData.options.push(
            {
              optionId: row.optionId,
              optionName: row.optionName,
              optionDescription: row.optionDescription,
            }
          );
        });
      }
      cb(electionData);
    });
  });
}

export function addVoterOption(details) {

}

export function submitVote(details) {
  details = {
    electionId: 1,
    userId: 1,
    options: {[
      option: {
        id: 1,
        rank: 2
      },
      option: {
        id: 3,
        rank: 1
      },
      option: {
        id: 2,
        rank: 3
      },
    ]}
  };

  const {
    electionId,
    userId,
    options
  } = details;

  const sql = `
    INSERT INTO election_votes (
      election_id,
      voter_id,
      voter_option_id,
      rank
    ) VALUES (
      (?), (?) ,(?) ,(?)
    )
  `;

  const stmt = db.prepare(sql);
  forEach(options, function(option) {
    stmt.run(electionId, userId, option.id, option.rank);
  });
  stmt.finalize();
}
