let socket;
let loaded = 0;
let isLoadable = true;
let boardId;
let sent = false;


// 投稿表示ボタン
async function showBoard(bId, post) {
    try {
        const res = await fetch("/backend/bbs/getmsg", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    boardId: bId
                }
            )
        });

        const messages = await res.json();

        if (res.ok) {
            boardId = bId;

            document.getElementById("post-btn").style.display = "none";

            document.getElementById("board").style.display = "none";

            document.getElementById("posting").style.display = "none";

            document.getElementById("board-content").style.display = "flex";

            if (logined) document.getElementById("sendmsg").style.display = "flex";

            const board = document.getElementById("board-content");

            board.innerHTML = "";

            const title = document.createElement("div");
            title.className = "section title";
            title.innerHTML = `<p>${post.title}</p>`;
            board.appendChild(title);


            const section1 = document.createElement("div");
            section1.className = "section message-t";

            section1.innerHTML = `
                <div class="content" id="1">
                    <div class="details">
                        <p class="sentby">
                            <img class="user-icon" src="${post.madeby.icon}" width="30px" height="30px">
                            ${post.madeby.name}
                        </p>
                        <p class="date">${post.madeby.date}</p>
                    </div>
                    <div class="message-text" ${post.message.font ? `style="font-family:${post.message.font};"` : ""}>
                        <p>${post.message.message}</p>
                    </div>
                </div>
            `;

            board.appendChild(section1);

            for (const item of messages) {
                const section = document.createElement("div");
                section.className = "section message-t";

                section.innerHTML = `
                    <div class="content" id="${item.message_id}">
                        <div class="details">
                            <p class="sentby">
                                <img class="user-icon" src="${item.sentby.icon}" width="30px" height="30px">
                                ${item.sentby.name}
                            </p>
                            <p class="date">${item.date}</p>
                        </div>
                        <div class="message-text" ${item.font ? `style="font-family:${item.font};"` : ""}>
                            <p>${item.text}</p>
                        </div>
                    </div>
                `;

                board.appendChild(section);
            }
        } else {
        }
    } catch (e) {
        console.log(e)
    }
}

// textarea処理
try {
    const textarea = document.getElementById("sendmsg-ta");
    function adjustHeight() {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
        if (textarea.scrollHeight < 43) textarea.style.height = "43px";
    }
    textarea.addEventListener("input", adjustHeight);
    adjustHeight();
} catch (e) {
    console.log(e)
}

// メッセージ送信処理
try {
    const sendBtn = document.getElementById("sendmsg-btn");
    sendBtn.addEventListener("click", async () => {
        const message = document.getElementById("sendmsg-ta").value;

        if (!message) return alert("何か入力してください");

        const res = await fetch("/backend/bbs/sendmsg", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(
                {
                    boardId,
                    message
                }
            )
        });

        sent = true;

        if (res.ok) {
            document.getElementById("sendmsg-ta").value = "";
            document.getElementById("sendmsg-ta").style.height = "43px";
        } else {
        }
    });
} catch (e) {
    console.log(e)
}

// 掲示板最初出す
(async () => {
    try {
        const res = await fetch("/backend/bbs/list");
        const posts = await res.json();
        if (res.ok) {
            if (posts.length < 15) isLoadable = false;
            loaded = loaded + posts.length;
            const board = document.getElementById("board");
            for (const post of posts) {
                const section = document.createElement("div");
                section.classList.add("section");

                const content = document.createElement("div");
                content.classList.add("content");
                content.id = `post-${post.id}`;

                const title = document.createElement("p");
                title.classList.add("title");
                title.textContent = post.title;

                const details = document.createElement("div");
                details.classList.add("details");

                const madeby = document.createElement("p");
                madeby.classList.add("madeby");
                madeby.innerHTML = `作成者：<img class="user-icon" src="${post.madeby.icon}" width="30px" height="30px"> ${post.madeby.name}`;

                const date = document.createElement("p");
                date.classList.add("date");
                date.textContent = `作成日：${post.madeby.date}`;

                const joining = document.createElement("p");
                joining.classList.add("joining");
                joining.textContent = `${post.members.length}人が参加中`;

                details.appendChild(madeby);
                details.appendChild(date);
                details.appendChild(joining);

                content.appendChild(title);
                content.appendChild(details);
                section.appendChild(content);
                const element = board.appendChild(section);
                element.addEventListener("click", async () => {
                    await showBoard(post.id, post);
                })
            }
        }
    } catch (e) {
        console.log(e)
    }
})();

// 掲示板関係処理
function updateMessage(item) {
    try {
        const board = document.getElementById("board-content");
        const distanceFromBottom = board.scrollHeight - board.scrollTop - board.clientHeight;
        const section = document.createElement("div");
        section.className = "section message-t";
        section.innerHTML = `
            <div class="content" id="${item.message_id}">
                <div class="details">
                    <p class="sentby">
                        <img class="user-icon" src="${item.sentby.icon}" width="30px" height="30px">
                        ${item.sentby.name}
                    </p>
                    <p class="date">${item.date}</p>
                </div>
                <div class="message-text" ${item.font ? `style="font-family:${item.font};"` : ""}>
                    <p>${item.text}</p>
                </div>
            </div>
        `;
        board.appendChild(section);

        if (sent || distanceFromBottom <= 30) {
            board.scrollTo({
                top: board.scrollHeight,
                behavior: "smooth"
            });
            sent = false;
        }
    } catch (e) {
        console.log(e)
    }
}
function updateBoard(post) {
    try {
        loaded++;
        const board = document.getElementById("board");

        const section = document.createElement("div");
        section.classList.add("section");

        const content = document.createElement("div");
        content.classList.add("content");
        content.id = `post-${post.id}`;

        const title = document.createElement("p");
        title.classList.add("title");
        title.textContent = post.title;

        const details = document.createElement("div");
        details.classList.add("details");

        const madeby = document.createElement("p");
        madeby.classList.add("madeby");
        madeby.innerHTML = `作成者：<img class="user-icon" src="${post.madeby.icon}" width="30px" height="30px"> ${post.madeby.name}`;

        const date = document.createElement("p");
        date.classList.add("date");
        date.textContent = `作成日：${post.madeby.date}`;

        const joining = document.createElement("p");
        joining.classList.add("joining");
        joining.textContent = `${post.members.length}人が参加中`;

        details.appendChild(madeby);
        details.appendChild(date);
        details.appendChild(joining);

        content.appendChild(title);
        content.appendChild(details);
        section.appendChild(content);
        board.prepend(section);
        const element = document.getElementById(`post-${post.id}`);
        element.addEventListener("click", async () => {
            await showBoard(post.id, post);
        })
    } catch (e) {
        console.log(e)
    }
}
try {
    const board = document.getElementById("board");
    board.addEventListener("scroll", async () => {
        const { scrollTop, scrollHeight, clientHeight } = board;
        if ((scrollHeight - (scrollTop + clientHeight)) <= 300) {
            if (!isLoadable) return;
            const res = await fetch("backend/bbs/load", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(
                    {
                        loaded
                    }
                )
            });
            const posts = await res.json();
            if (res.ok) {
                if (posts.length < 15) isLoadable = false;
                loaded = loaded + posts.length;
                const board = document.getElementById("board");
                for (const post in posts) {
                    const section = document.createElement("div");
                    section.classList.add("section");

                    const content = document.createElement("div");
                    content.classList.add("content");
                    content.id = `post-${post.id}`;

                    const title = document.createElement("p");
                    title.classList.add("title");
                    title.textContent = post.title;

                    const details = document.createElement("div");
                    details.classList.add("details");

                    const madeby = document.createElement("p");
                    madeby.classList.add("madeby");
                    madeby.innerHTML = `作成者：<img class="user-icon" src="${post.madeby.icon}" width="30px" height="30px"> ${post.madeby.name}`;

                    const date = document.createElement("p");
                    date.classList.add("date");
                    date.textContent = `作成日：${post.madeby.date}`;

                    const joining = document.createElement("p");
                    joining.classList.add("joining");
                    joining.textContent = `${post.members.length}人が参加中`;

                    details.appendChild(madeby);
                    details.appendChild(date);
                    details.appendChild(joining);

                    content.appendChild(title);
                    content.appendChild(details);
                    section.appendChild(content);
                    const element = board.appendChild(section);
                    element.addEventListener("click", async () => {
                        await showBoard(post.id, post);
                    })
                }
            }
        }
    });
} catch (e) {
    console.log(e)
}

// ホーム画面処理
let logined = false;
let userData;
async function autoLogin() {
    const token = localStorage.getItem("token");
    if (!token) {
        return;
    }
    try {
        const res = await fetch("/backend/profile", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });
        const data = await res.json();
        userData = data;
        if (res.ok) {
            document.getElementById("signups").style.display = "none";
            document.getElementById("logins").style.display = "none";
            document.getElementById("post-btn").style.display = "block";
            logined = true;
            socket = io({
                auth: { token }
            });
            socket.on("update", async function (msg) {
                updateBoard(msg);
            });
            socket.on("msg", function (msg) {
                updateMessage(msg);
            });
            socket.on("message", function (msg) {
                console.log(msg);
            });
        } else {
            localStorage.removeItem("token");
        }
    } catch (err) {
        console.error(err);
    }
}
window.addEventListener("DOMContentLoaded", autoLogin);

// 投稿フォーム表示ボタン
try {
    let post_closed = true;
    const post_button = document.getElementById("post");
    post_button.addEventListener("click", () => {
        if (post_closed) {
            document.getElementById("posting").style.bottom = "0px";
            post_button.style.transform = "rotate(45deg)";
            post_closed = false;
        } else {
            document.getElementById("posting").style.bottom = "calc(-1 * (100% - max(10vh, 50px)))";
            post_button.style.transform = "rotate(0deg)";
            post_closed = true;
        }
    });
} catch (e) {
    console.log(e)
}

// 投稿ボタン
try {
    const post_btn = document.getElementById("posting-btn");
    post_btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const title = document.getElementById("pti").value;
        const message = document.getElementById("pmi").value;

        if (!logined) return alert("ログインしていないと投稿できません")

        if (!title || !message) return alert("何かを入力してください");

        const res = await fetch("/backend/bbs/post", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(
                {
                    title,
                    message
                }
            )
        });

        const post = await res.json();

        document.getElementById("post-btn").click();

        if (res.ok) {
            const boardDiv = document.getElementById("board");
            boardDiv.style.display = "none";
            const boardContent = document.getElementById("board-content");
            boardContent.style.display = "flex";

            showBoard(post.id, post);
        } else {
            return alert("エラーが発生しました");
        }
    });
} catch (e) {
    console.log(e)
}

// サイドメニュー
try {
    let closed = false;
    const arrow_button = document.getElementById("arrow-btn");
    arrow_button.addEventListener("click", () => {
        if (!closed) {
            document.getElementById("sidemenu").style.left = `-${getComputedStyle(document.getElementById("sidemenu")).width}`;
            document.getElementById("board").classList.add("board-close");
            document.getElementById("posting").classList.add("board-close");
            document.getElementById("sendmsg").classList.add("board-close");
            document.getElementById("board-content").classList.add("board-close");
            document.getElementById("arrow").classList.add("close");
            closed = true;
        } else {
            document.getElementById("sidemenu").style.left = "0";
            document.getElementById("board").classList.remove("board-close");
            document.getElementById("posting").classList.remove("board-close");
            document.getElementById("sendmsg").classList.remove("board-close");
            document.getElementById("board-content").classList.remove("board-close");
            document.getElementById("arrow").classList.remove("close");
            closed = false;
        }
    });
} catch (e) {
    console.log(e)
}

try {
    // パスワードボタン
    const password_button = document.getElementById("visibility");
    const password_input = document.getElementById("pw");
    const password_icon = document.getElementById("password-visibility");
    password_button.addEventListener("click", () => {
        if (password_icon.classList.contains("fa-eye")) {
            password_input.type = "password";
            password_icon.classList.remove("fa-eye");
            password_icon.classList.add("fa-eye-slash");
        } else {
            password_input.type = "text";
            password_icon.classList.remove("fa-eye-slash");
            password_icon.classList.add("fa-eye");
        }
    });
} catch (e) {
    console.log(e)
}

try {
    // ボタン関係
    const create_buttons = document.getElementsByClassName("create-btn");
    for (const button of create_buttons) {
        button.addEventListener("click", () => {
            window.location.href = "/signup.html";
        });
    }
    const login_buttons = document.getElementsByClassName("login-btn");
    for (const button of login_buttons) {
        button.addEventListener("click", () => {
            window.location.href = "/login.html";
        });
    }
} catch (e) {
    console.log(e)
}

try {
    // アカウント作成処理
    document.getElementById("signupForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const form = e.target;
        const email = form.email.value.trim();
        const password = form.password.value.trim();
        const username = form.username.value.trim();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("メールアドレスの形式が正しくありません。");
            return;
        }

        if (password.length < 6) {
            alert("パスワードは6文字以上にしてください。");
            return;
        }

        const formData = new FormData(e.target);

        document.getElementById("forms").style.display = "none";
        document.getElementById("message").style.display = "flex";

        const res = await fetch("/backend/signup", {
            method: "POST",
            body: formData,
        });

        if (res.ok) {
            document.getElementById("spinner").style.display = "none";
            document.getElementById("pmessage").innerText = (await res.json()).message;
            document.getElementById("pmessage").style.display = "block";
            const socket = io({
                query: {
                    username,
                    email
                }
            });
            socket.on("message", async function (msg) {
                if (msg === "verified") {
                    const res1 = await fetch("/backend/login", {
                        method: "POST",
                        body: formData,
                    });
                    const data = await res1.json();
                    if (res1.ok) {
                        localStorage.setItem("token", data.token);
                        alert(`${data.username || "ユーザー"} さん、ログイン成功！`);
                        window.location.href = "/index.html";
                    } else {
                        alert(data.message);
                    }
                }
            });
        } else {
            alert((await res.json()).message)
            document.getElementById("forms").style.display = "flex";
            document.getElementById("message").style.display = "none";
        }
    });
} catch (e) {
    console.log(e)
}

try {
    // ログイン処理
    document.getElementById("loginForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);

        const res = await fetch("/backend/login", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("token", data.token);
            window.location.href = "/index.html";
        } else {
            alert(data.message);
        }
    });
} catch (e) {
    console.log(e)
}

try {
    document.getElementById("logout").addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.reload();
    });
} catch (e) {
    console.log(e)
}