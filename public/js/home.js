async function render() {
  try {
    const data = await $.ajax({
      type: "GET",
      url: "/user",
    });
    data.map(function (ele) {
      const friend = `
    <div class="friend">
      <h4>${ele.username} 
      <button onclick='changePass("${ele._id}")'>doi mat khau</button>
      <button onclick='deleteUser("${ele._id}")'> delete </button>
      </h4>
    </div>
    `;

      $(".listFriend").append(friend);
    });
  } catch (error) {
    console.log(error);
  }
}

async function logon() {
  try {
    let username = $("#username").val();
    let password = $("#password").val();
    const res = await $.ajax({
      url: "/user/",
      type: "POST",
      data: {
        username: username,
        password: password,
      },
    });
    if (res.status === 200) {
      window.location.href = "/member";
    }
  } catch (error) {
    console.log(error);
  }
}

function changePass(id) {
  $(".changePass").css("display", "block");
  $(".btnChange").attr("onclick", `changePassword("${id}")`);
}

async function changePassword(id) {
  try {
    const newPass = $("#newPass").val();
    const confirm = $("#confirm").val();
    console.log(newPass);
    console.log(confirm);
    if (newPass == confirm) {
      await $.ajax({
        url: "/user/" + id,
        type: "PUT",
        data: { newPass, confirm },
      });
      $(".listFriend").html("");
      render();
    } else {
      $(".noti").html("mat khau chua khop nhau");
    }
  } catch (error) {
    console.log(error);
  }
}

render();

$.ajax({
  url: "/user/checkLogin",
  type: "POST",
})
  .then((data) => {
    if (data.status !== 200) {
      window.location.href = "/login";
    }
  })
  .catch((err) => {
    console.log(err);
  });

function delete_cookie(name) {
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

async function logout() {
  try {
    const res = await $.ajax({
      url: "/user/logout",
      type: "POST",
    });
    if (res.status === 200) {
      delete_cookie("user");
      window.location.href = "/login";
    }
  } catch (error) {
    console.log(error);
  }
}
async function loghome() {
  try {
    const res = await $.ajax({
      url: "/catalog",
      type: "Get",
    });
    window.location.href = "/catalog";
  } catch (error) {
    console.log(error);
  }
}
async function deleteUser(id) {
  try {
    const response = await $.ajax({
      type: "DELETE",
      url: "/user/" + id,
    });

    alert(response.mess);
    $(".listFriend").html("");
    render();
  } catch (error) {
    console.log(error);
  }
}
