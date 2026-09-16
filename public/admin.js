const SUPABASE_URL = "https://gcdrkdlqryvjcagutyjc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_hOx4zpm2HzEO8m4wnUiDRA_RyQ-aQEM";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginButton").addEventListener("click", login);
  document.getElementById("logoutButton").addEventListener("click", logout);
  document.getElementById("createEventButton").addEventListener("click", createEvent);
  document.getElementById("uploadButton").addEventListener("click", uploadPhoto);

  checkSession();
});

async function checkSession() {
  const { data } = await supabaseClient.auth.getSession();

  if (data.session) {
    showAdmin();
  }
}

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Enter your email and password.");
    return;
  }

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  showAdmin();
}

function showAdmin() {
  document.getElementById("login").style.display = "none";
  document.getElementById("admin").style.display = "block";
}

async function logout() {
  await supabaseClient.auth.signOut();
  location.reload();
}

async function createEvent() {
  const name = document.getElementById("eventName").value.trim();
  const date = document.getElementById("eventDate").value;
  const location = document.getElementById("eventLocation").value.trim();

  if (!name) {
    alert("Enter an event name.");
    return;
  }

  const { error } = await supabaseClient
    .from("events")
    .insert({
      name,
      date: date || null,
      location: location || null
    });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Event created!");
}

async function uploadPhoto() {
  const file = document.getElementById("photoFile").files[0];

  if (!file) {
    alert("Choose a photo first.");
    return;
  }

  const filePath = `${Date.now()}-${file.name}`;

  const { error } = await supabaseClient.storage
    .from("photos")
    .upload(filePath, file);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Photo uploaded!");
}
async function loadPhotos() {
  const { data, error } = await supabaseClient
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  console.log("Uploaded photos:", data);
}
