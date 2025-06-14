// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, arrayRemove, Timestamp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDmoNgi43__XfEhcxOJuIj8EefX9m6Vonc",
    authDomain: "plustwo-ac8cf.firebaseapp.com",
    projectId: "plustwo-ac8cf",
    storageBucket: "plustwo-ac8cf.firebasestorage.app",
    messagingSenderId: "186273618852",
    appId: "1:186273618852:web:f6ecd29aea9e6e57397f31"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
setPersistence(auth, browserLocalPersistence);

function updateTime(person, tz) {
    let now = new Date(new Date().toLocaleString("en-US", {timeZone: tz}));
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    if (hours < 10) hours = "0" + hours;
    if (hours > 12) hours -= 12;
    if (hours == 0) hours = 12;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    $("#" + person + " .time .big").html(hours + ":" + minutes);
    if (person == selectedUser) {
        let day = now.getDay();
        let month = now.getMonth();
        let date = now.getDate();
        let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        $("#" + person + " .time .small").html(days[day] + " " + months[month] + " " + date + "<br>" + (now.getHours() < 12 ? "AM" : "PM") + "<br>" + seconds);
    } else {
        $("#" + person + " .time .small").html((now.getHours() < 12 ? "AM" : "PM") + "<br>" + seconds);
    }
}

let selectedUser = null;
let otherUser = null;
let notifications = [];
let bookmarks = [{}, {}, {}, {}, {}, {}, {}, {}];
async function authLoaded() {
    if (auth.currentUser.email == atob("cm9uZ2phY2ttaWxlc0BnbWFpbC5jb20=")) {
        selectedUser = "jack";
        otherUser = "grace";
    } else if (auth.currentUser.email == atob("eXVncmFjZTE3MDQ4QGdtYWlsLmNvbQ==")) {
        selectedUser = "grace";
        otherUser = "jack";
    }
    let snap = await getDoc(doc(firestore, "data", "notifications"));
    if (snap.data()[selectedUser].indexOf("notebook") != -1) {
        notifications.push("notebook");
        $("#notebook-button").append("<div class='notification'></div>");
    }
    if (notifications.length) {
        $("#menu-button").append("<div class='notification'></div>");
    }
    let moodSnap = await getDoc(doc(firestore, "data", "mood"));
    let resetDate = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Chicago"}));
    resetDate.setHours(4, 0, 0, 0);
    let afterFour = (new Date(new Date().toLocaleString("en-US", {timeZone: "America/Chicago"}))) > resetDate;
    if (afterFour && moodSnap.data().update.toDate() < resetDate) {
        await updateDoc(doc(firestore, "data", "mood"), {
            update: Timestamp.fromDate(new Date()),
            grace: "#808080",
            jack: "#808080"
        });
    } else {
        $("#grace .mood div").css("background-color", moodSnap.data().grace);
        $("#jack .mood div").css("background-color", moodSnap.data().jack);
        $("#mood-modal input[type='color']").val(moodSnap.data()[selectedUser]);
    }

    $(".mood").removeClass("hidden");
    $("#" + selectedUser + " .mood").addClass("pointer").click(() => {
        $("#mood-modal").removeClass("hidden");
    });
    setTimeout(() => {
        $("#" + selectedUser + " .time .big").css("font-size", "7rem");
        if (selectedUser == "jack") {
            $("#jack .mood div").css("margin-right", "30px");
        } else {
            $("#grace .mood div").css("margin-left", "30px");
        }
    }, 300);
}

$("#green").click(async () => {
    await updateDoc(doc(firestore, "data", "mood"), {
        [selectedUser]: "#2cc42c",
        update: Timestamp.fromDate(new Date())
    });
    $("#mood-modal").addClass("hidden");
    $("#" + selectedUser + " .mood div").css("background-color", "#2cc42c");
    $(".mood-entry input[type='color']").val("#2cc42c");
});
$("#yellow").click(async () => {
    await updateDoc(doc(firestore, "data", "mood"), {
        [selectedUser]: "#e2d408",
        update: Timestamp.fromDate(new Date())
    });
    $("#mood-modal").addClass("hidden");
    $("#" + selectedUser + " .mood div").css("background-color", "#e2d408");
    $(".mood-entry input[type='color']").val("#e2d408");
});
$("#red").click(async () => {
    await updateDoc(doc(firestore, "data", "mood"), {
        [selectedUser]: "#ee0000",
        update: Timestamp.fromDate(new Date())
    });
    $("#mood-modal").addClass("hidden");
    $("#" + selectedUser + " .mood div").css("background-color", "#ee0000");
    $(".mood-entry input[type='color']").val("#ee0000");
});
$(".mood-entry input[type='color']").change(async () => {
    let color = $(".mood-entry input[type='color']").val();
    await updateDoc(doc(firestore, "data", "mood"), {
        [selectedUser]: color,
        update: Timestamp.fromDate(new Date())
    });
    $("#mood-modal").addClass("hidden");
    $("#" + selectedUser + " .mood div").css("background-color", color);
});
$("#mood-modal .close-button").click(() => {
    $("#mood-modal").addClass("hidden");
});
$(() => {
    let now = new Date();
    setTimeout(() => {
        updateTime("grace", "America/Chicago");
        updateTime("jack", "America/New_York");
        setInterval(() => {
            updateTime("grace", "America/Chicago");
            updateTime("jack", "America/New_York");
        }, 1000);
    }, 1000 - now.getMilliseconds());

    if (localStorage.getItem("bookmarks")) {
        bookmarks = JSON.parse(localStorage.getItem("bookmarks"));
        bookmarks.forEach((bookmark) => {
            if (bookmark.url) {
                $("<div class='bookmark'><img src='https://favicone.com/" + bookmark.url.replace(/^\/\/|^.*?:(\/\/)?/, '') + "?s=48' /><span>" + bookmark.name + "</span></div>").click(() => {
                    window.open(bookmark.url, "_self");
                }).appendTo("#bookmarks");
            }
        });
    }

    let email = null;
    let password = null;
    if (localStorage.getItem("email")) {
        email = localStorage.getItem("email");
        $("#username").val(localStorage.getItem("email"));
    }
    if (localStorage.getItem("password")) {
        password = localStorage.getItem("password");
        $("#password").val(localStorage.getItem("password"));
    }
    if (email && password && !auth.currentUser) {
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                authLoaded();
            })
            .catch((error) => {
                alert("Error signing in: " + error.message);
            });
    } else if (auth.currentUser) {
        authLoaded();
    }
});

let authShown = false;
$("#auth-button").click(() => {
    if (!authShown) {
        authShown = true;
        $("#auth").addClass("shown");
    } else {
        localStorage.setItem("email", $("#username").val());
        localStorage.setItem("password", $("#password").val());
        location.reload();
    }
});

let menuShown = false;
$("#menu-button").click(() => {
    $("#bookmarks").toggleClass("hidden");
    $("#menu").toggleClass("hidden");
    if (!menuShown) {
        menuShown = true;
        $("#menu-button span").html("arrow_forward_ios");
        $("#menu-button .notification").remove();
    } else {
        menuShown = false;
        $("#menu-button span").html("arrow_back_ios");
        if (notifications.length) {
            $("#menu-button").append("<div class='notification'></div>");
        }
    }
});

let curState = "home";
$("#notebook-button").click(async () => {
    if (curState == "notebook") {
        curState = "home";
        $(".content").empty();
    } else {
        curState = "notebook";
        if (notifications.indexOf("notebook") != -1) {
            notifications.splice(notifications.indexOf("notebook"), 1);
            $("#notebook-button .notification").remove();
            await updateDoc(doc(firestore, "data", "notifications"), {
                [selectedUser]: arrayRemove("notebook")
            });
        }
        $("#" + selectedUser + " .content").html("<textarea id='textbox'></textarea>");
        $("#" + otherUser + " .content").html("<div id='text'></div>");
        let docSnap = await getDoc(doc(firestore, "data", "notebook"));
        $("#textbox").val(docSnap.data()[selectedUser]);
        $("#text").html(docSnap.data()[otherUser]);
        $("#textbox").on("change", async () => {
            await updateDoc(doc(firestore, "data", "notebook"), {
                [selectedUser]: $("#textbox").val()
            });
            await updateDoc(doc(firestore, "data", "notifications"), {
                [otherUser]: arrayUnion("notebook")
            });
        });
    }
});

$("#bookmark-button").click(() => {
    $("#bookmark-modal").removeClass("hidden");
    $("#bookmark-modal .bookmark-entry").remove();
    for (let i = 0; i < bookmarks.length; i++) {
        $("#bookmark-modal").append("<div class='bookmark-entry' id='bookmark-" + i + "'><input size='50' type='text' placeholder='Name' value = '" + (bookmarks[i]?.name || "") + "' /><input size='50' type='url' placeholder='URL' value = '" + (bookmarks[i]?.url || "") + "' /></div>");
    }
});
$("#bookmark-modal .close-button").click(() => {
    $("#bookmark-modal").addClass("hidden");
    for (let i = 0; i < bookmarks.length; i++) {
        let name = $("#bookmark-" + i + " input[type='text']").val();
        let url = $("#bookmark-" + i + " input[type='url']").val();
        if (!/^https?:\/\//i.test(url)) {
            url = 'http://' + url;
        }
        if (name && url) {
            bookmarks[i] = {name: name, url: url};
        } else {
            bookmarks[i] = {};
        }
    }
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    $("#bookmarks").empty();
    bookmarks.forEach((bookmark) => {
        if (bookmark.name && bookmark.url) {
            $("<div class='bookmark'><img src='https://favicone.com/" + bookmark.url.replace(/^\/\/|^.*?:(\/\/)?/, '') + "?s=48' /><span>" + bookmark.name + "</span></div>").click(() => {
                window.open(bookmark.url, "_self");
            }).appendTo("#bookmarks");
        }
    });
    $("#menu-button").click();
});