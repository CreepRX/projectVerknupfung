const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sanitizer = require("sanitizer");
const { array } = require("yargs");
admin.initializeApp();

exports.helloWorld = functions
  .region("europe-west1")
  .https.onCall((data, context) => {
    return "Hello world";
  });

exports.addPoetry = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
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

exports.getPoetry = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
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
      console.log(p);
      console.log(p["poetUID"]);
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

      p['users'] = users

      r.push(p);
    }

    return r;
  });

exports.getUser = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
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

exports.addPicture = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
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

    console.log(owner, fileName, mood, time);

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
  .onCreate((snap, context) => {
    const entry = snap.data();

    const fileName = entry.fileName;
    const mood = entry.mood;
    const painter = entry.ownerUID;

    const callback = function (id, data) {
      admin.firestore().collection("poetry").doc(id).update({
        picture: fileName,
        painterUID: painter,
        hasPic: true,
      });
    };

    admin
      .firestore()
      .collection("poetry")
      .where("mood", "==", mood)
      // .where("picture", "==", "")
      .orderBy("createdAt", "asc")
      .get()
      .then((snaps) => {
        // console.log("=====matching pic with poetry======");

        snaps.forEach((doc) => {
          const data = doc.data();
          if (data["hasPic"] === "false" || !data["hasPic"]) {
            callback(doc.id, data);
            return;
          }
        });
      });

    return "";
  });
