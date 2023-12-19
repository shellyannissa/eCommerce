"use strict";

const { db } = require("../database/firebaseConfig");
const { ref, get, set, update, increment } = require("firebase/database");

function addMinutesAndSeconds(timeString, minutesToAdd, secondsToAdd) {
  const dateTime = new Date(timeString);
  dateTime.setMinutes(dateTime.getMinutes() + minutesToAdd);
  dateTime.setSeconds(dateTime.getSeconds() + secondsToAdd);
  return dateTime;
}

module.exports = {
  getAllEntries: async (endpoint) => {
    const reference = ref(db, endpoint);
    const snapshot = await get(reference);
    return snapshot.val();
  },
  errResponse: (ctx, error) => {
    console.log(error.message);
    ctx.status = 500;
    ctx.body = {
      message: JSON.stringify(error.message),
    };
    return ctx;
  },
  activateQn: async (qnId) => {
    const questionRef = ref(db, `ques/${qnId}`);

    //* setting the starting and ending Instant for mark tabulation purposes
    const questionSnapshot = await get(questionRef);
    const now = new Date();
    const allottedMin = questionSnapshot.val().allottedMin;
    const allottedSec = questionSnapshot.val().allottedSec;
    const endingInstant = addMinutesAndSeconds(
      now.toISOString(),
      allottedMin,
      allottedSec
    );
    const updates = {
      startedInstant: now,
      endingInstant: endingInstant,
    };
    update(questionRef, updates);

    //to invoke the display tab
    const seconds = (endingInstant.getTime() - now.getTime()) / 1000;
    const options = questionSnapshot.val().options;
    const postContent = {
      type: "ques",
      description: questionSnapshot.val().description,
      options,
      allottedMin,
      allottedSec,
      seconds,
      qnId,
    };
    const displayRef = ref(db, "display");
    set(displayRef, postContent);
    setTimeout(() => {
      set(displayRef, {
        type: "None",
      });
    }, seconds * 1000);
    return { qnId };
  },
  evaluate: async (qnId) => {
    const qnRef = ref(db, `ques/${qnId}`);
    const qnSnapshot = (await get(qnRef)).val();
    const ansRef = ref(db, `ans/${qnId}`);
    const ansSnapshot = await get(ansRef);
    const correctOpnIdx = qnSnapshot.correctOpnIdx;
    const weightage = qnSnapshot.weightage;
    const startingInstant = new Date(qnSnapshot.startedInstant);
    const endingInstant = new Date(qnSnapshot.endingInstant);
    const quizId = qnSnapshot.quizId;

    //* alloting points to the correct answer
    if (ansSnapshot.exists()) {
      ansSnapshot.forEach((childSnapshot) => {
        const optionIdx = childSnapshot.val().optionIdx;
        if (optionIdx === correctOpnIdx) {
          const userId = childSnapshot.val().userId;
          const regRef = ref(db, `reg/${quizId}/${userId}`);
          const answeredInstant = new Date(childSnapshot.val().answeredInstant);
          const ratio =
            (endingInstant.getTime() - answeredInstant.getTime()) /
            (endingInstant.getTime() - startingInstant.getTime());
          // @ts-ignore
          const points = parseInt(weightage * ratio);
          console.log(points);
          const updates = {
            points: increment(points),
          };
          update(regRef, updates);
        }
      });
    }

    //* setting position of each user
    const regRef = ref(db, `reg/${quizId}`);
    try {
      const snapshot = await get(regRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const orderedEntries = Object.entries(data).sort(
          (a, b) => b[1].points - a[1].points
        );

        orderedEntries.forEach((entry, index) => {
          const [userId, userData] = entry;
          const newPosition = index + 1;

          set(ref(db, `reg/${quizId}/${userId}/position`), newPosition);
        });
      }
    } catch (error) {
      console.error("Error fetching or updating data:", error);
      throw new Error(error);
    }

    return quizId;
  },
  questionStats: async (qnId) => {
    const ansRef = ref(db, `ans/${qnId}`);
    const snapshot = await get(ansRef);
    const questionRef = ref(db, `ques/${qnId}`);
    const questionSnapshot = (await get(questionRef)).val();
    const options = questionSnapshot.options;
    let temp = {};
    for (let i = 0; i < options.length; i++) {
      temp[i] = 0;
    }
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const optionIdx = childSnapshot.val().optionIdx;
        temp[optionIdx]++;
      });
    }
    for (let i = 0; i < options.length; i++) {
      const idx = options[i].idx;
      options[i].count = temp[idx];
    }
    questionSnapshot.options = options;
    const postContent = {
      type: "stat",
      description: questionSnapshot.description,
      options,
      allottedMin: questionSnapshot.allottedMin,
      allottedSec: questionSnapshot.allottedSec,
      qnId,
    };
    const displayRef = ref(db, "display");
    set(displayRef, postContent);
    return { qnId };
  },
  extendPoints: async (quizId) => {
    const prevLeadRef = ref(db, "prevLead");
    let snapshot = await get(prevLeadRef);
    let entries = snapshot.val();
    entries = entries.map(async (entry) => {
      const userId = entry.userId;
      const regRef = ref(db, `reg/${quizId}/${userId}`);
      const snapshot = await get(regRef);
      const newPoints = snapshot.val().points;
      const userRef = ref(db, `user/${userId}`);
      const snapshot2 = await get(userRef);
      const userName = snapshot2.val().userName;
      return {
        userId,
        points: newPoints,
        userName,
      };
    });
    entries = await Promise.all(entries);
    const postContent = {
      type: "extend",
      data: entries,
    };
    const displayRef = ref(db, "display");
    set(displayRef, postContent);
    return quizId;
  },
  getLeaderBoard: async (quizId) => {
    const regRef = ref(db, `reg/${quizId}`);
    const snapshot = await get(regRef);
    const data = snapshot.val();
    let orderedEntries = Object.entries(data).sort(
      (a, b) => b[1].points - a[1].points
    );
    orderedEntries = orderedEntries.slice(0, 10);
    // @ts-ignore
    orderedEntries = orderedEntries.map(async (entry) => {
      const [userId, userData] = entry;
      const userRef = ref(db, `user/${userId}`);
      const snapshot = await get(userRef);
      const userInfo = snapshot.val();
      return {
        userId,
        userName: userInfo.userName,
        avatar: userInfo.avatar,
        points: userData.points,
        position: userData.position,
      };
    });
    orderedEntries = await Promise.all(orderedEntries);
    const postContent = {
      type: "lead",
      data: orderedEntries,
    };
    const displayRef = ref(db, "display");
    set(displayRef, postContent);
    const prevLeadRef = ref(db, "prevLead");
    set(prevLeadRef, orderedEntries);
    return { quizId };
  },
  userStanding: async (userId, quizId) => {
    const regRef = ref(db, `reg/${quizId}/${userId}`);
    const snapshot = await get(regRef);
    const data = snapshot.val();
    const userRef = ref(db, `user/${userId}`);
    const snapshot2 = await get(userRef);
    const userInfo = snapshot2.val();
    const postContent = {
      type: "userStanding",
      userId,
      userName: userInfo.userName,
      avatar: userInfo.avatar,
      points: data.points,
      position: data.position,
    };
    return postContent;
  },
};
