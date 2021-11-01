const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sanitizer = require("sanitizer");
const { UserPropertyValue } = require("firebase-functions/v1/analytics");
admin.initializeApp();

exports.helloWorld = functions.https.onCall((dkata, context) => {
  return "Hello world";
});

exports.addPoetry = functions.https.onCall(async (data, context) => {

  if (!data) {
    throw new functions.https.HttpsError("invalid-argument", "data is null");
  }
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can add requests"
    );
  }

  let title = sanitizer.sanitize(data["title"]);
  let content = sanitizer.sanitize(data["content"]);
  let mood = sanitizer.sanitize(data["mood"]);
  let time = new Date().getTime();

  content = content.replace("\n", "</br>");
  let poetUID = context.auth.uid;

  if (
    title === "" ||
    !title ||
    content === "" ||
    !content ||
    mood === "" ||
    !mood
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "something is missing from your poetry (title, content, or mood) or you may have html tags on your poetry"
    );
  }

  admin.firestore().collection("poetry").add({
    title: title,
    content: content,
    mood: mood,
    createdAt: time,
    poetUID: poetUID,
    hasPic: false,
    likes: 0,
  });
  return "OK";
});

exports.addUserToDB = functions.auth.user().onCreate((user) => {
  admin.firestore().collection("users").doc(user.uid).set({
    email: user.email,
    profilePic: user.photoURL,
    name: user.displayName,
  });
});

exports.getPoetry = functions.https.onCall(async (data, context) => {
  let poetry = await admin
    .firestore()
    .collection("poetry")
    .orderBy("createdAt", "desc")
    .limit(10)
    .get()
    .then((snapshots) => {
      const snap = snapshots.docs;
      let docs = [];
      for (var i in snap) {
        const doc = snap[i].data();
        doc.id = snap[i].id;
        docs.push(doc);
      }
      return docs;
    })
    .catch((err) => {
      throw new functions.https.HttpsError(
        "not-found",
        "cannot find any poetry " + err.message
      );
    });

  if (poetry.length === 0) {
    return poetry;
  }

  let r = [];

  for (let i = 0; i < poetry.length; i++) {
    const p = poetry[i];
    let users = [];
    let poet = await admin
      .firestore()
      .collection("users")
      .doc(p["poetUID"])
      .get()
      .then((snap) => {
        return snap.data();
      });
    users.push(poet);

    if (p["hasPic"]) {
      let picOwner = await admin
        .firestore()
        .collection("users")
        .doc(p["painterUID"])
        .get()
        .then((snap) => {
          return snap.data();
        });
      users.push(picOwner);
    }

    p["users"] = users;

    r.push(p);
  }

  return r;
});

exports.getUser = functions.https.onCall(async (data, context) => {
  const ret = await admin
    .firestore()
    .collection("users")
    .doc(data["UID"])
    .get()
    .then((snap) => {
      return snap.data();
    });
  return ret;
});

exports.addPicture = functions.https.onCall(async (data, context) => {
  if (!data) {
    throw new functions.https.HttpsError("invalid-argument", "data is null");
  }
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can add requests"
    );
  }
  const owner = context.auth.uid;
  const fileName = data["link"];
  const mood = data["mood"];
  let time = new Date().getTime();

  if (fileName === "" || !fileName === "") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "missing the link to file"
    );
  }

  if (mood === "" || !mood) {
    throw new functions.https.HttpsError("invalid-argument", "data is null");
  }
  admin.firestore().collection("pictures").add({
    fileName: fileName,
    mood: mood,
    createdAt: time,
    ownerUID: owner,
  });

  return "OK";
});

exports.matchPicWithPoetry = functions.firestore
  .document("pictures/{pictureID}")
  .onCreate(async (snap, context) => {
    const entry = snap.data();

    functions.logger.log("hey");

    const fileName = entry.fileName;
    const mood = entry.mood;
    const painter = entry.ownerUID;

    // const callback = function (id, data) {

    //   });

    functions.logger.log("hey2");

    const id = await admin
      .firestore()
      .collection("poetry")
      .get()
      .then((snaps) =>
        snaps.query
          .where("mood", "==", mood)
          .where("hasPic", "==", false)
          .orderBy("createdAt")
          .get()
      )
      .then((snap) => {
        functions.logger.log(snap.docs);

        return snap.docs[0].id;
      });
    

      return await admin.firestore().collection("poetry").doc(id).update({
        picture: fileName,
        painterUID: painter,
        hasPic: true,
      })
  });

exports.like = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can add requests"
    );
  }
  const poetryID = data["poetry"];
  const userID = context.auth.uid;

  let users = await admin
    .firestore()
    .collection("likes")
    .get()
    .then((snaps) => {
      const snap = snaps.docs;
      for (var i in snap) {
        const doc = snap[i].data();
        if (snap[i].id === poetryID) {
          return doc["users"];
        }
      }
    });


  if (!users.includes(userID)) {
    users.push(userID);
  }


  admin.firestore().collection("likes").doc(poetryID).set({
    users: users,
  });
});

exports.dislike = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can add requests"
    );
  }
  const poetryID = data["poetry"];
  const userID = context.auth.uid;

  let users = await admin
    .firestore()
    .collection("likes")
    .get()
    .then((snaps) => {
      const snap = snaps.docs;
      for (var i in snap) {
        const doc = snap[i].data();
        if (snap[i].id === poetryID) {
          return doc["users"];
        }
      }
    });

  if (users.includes(userID)) {
    const i = users.indexOf(userID);
    users.splice(i);
  }

  admin.firestore().collection("likes").doc(poetryID).set({
    users: users,
  });
});

exports.onLikeOrDislike = functions.firestore
  .document("likes/{likeID}")
  .onUpdate((snap, context) => {
    const likes = snap.after.data()["users"].length;

    const id = snap.after.id;

    admin.firestore().collection("poetry").doc(id).update({
      likes: likes,
    });
  });

exports.onPoetryAdd = functions.firestore
  .document("poetry/{poetryID}")
  .onCreate((snap, context) => {
    const id = snap.id;
    admin.firestore().collection("likes").doc(id).set({
      users: [],
    });
  });

exports.checkLiked = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can add requests"
    );
  }

  const poetryID = data["poetry"];
  const UID = context.auth.uid;

  let users = await admin
    .firestore()
    .collection("likes")
    .get()
    .then((snaps) => {
      const snap = snaps.docs;
      for (var i in snap) {
        const doc = snap[i].data();
        if (snap[i].id === poetryID) {
          return doc["users"];
        }
      }
    });

  const isLiked = users.includes(UID);

  return {
    isLiked: isLiked,
  };
});
