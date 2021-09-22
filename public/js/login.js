async function login() {
  try {
    const username = $("#username").val();
    const password = $("#password").val();
    const res = await $.ajax({
      url: "/user/login",
      type: "POST",
      data: { username, password },
    });
    if (res.status === 200) {
      console.log(res);
      setCookie("user", res.id, 30);
      window.location.href = "/catalog";
    } else {
      $(".noti").html(res.mess);
    }
  } catch (error) {
    console.log(error);
    $(".noti").html(res.mess);
  }
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

$.ajax({
  url: "/user/checkLogin",
  type: "POST",
  headers: {},
})
  .then((data) => {
    if (data.status === 200) {
      window.location.href = "/";
    }
  })
  .catch((err) => {
    console.log(err);
  });
