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

  loadPhotos();
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
  const athleteName = document.getElementById("athleteName").value.trim();
  const teamName = document.getElementById("teamName").value.trim();
  const jerseyNumber = document.getElementById("jerseyNumber").value.trim();

  if (!file) {
    alert("Choose a photo first.");
    return;
  }

  const filePath = `${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabaseClient.storage
    .from("photos")
    .upload(filePath, file);

  if (uploadError) {
    alert(uploadError.message);
    return;
  }

  const { error: dbError } = await supabaseClient
    .from("photos")
    .insert({
      athlete_name: athleteName || null,
      team_name: teamName || null,
      jersey_number: jerseyNumber || null,
      file_path: filePath
    });

  if (dbError) {
    alert(dbError.message);
    return;
  }

  alert("Photo uploaded!");
  loadPhotos();
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

  const photoList = document.getElementById("photoList");

  if (!photoList) {
    return;
  }

  if (!data.length) {
    photoList.innerHTML = "<p>No photos uploaded yet.</p>";
    return;
  }

  photoList.innerHTML = "";

  data.forEach(photo => {
    const item = document.createElement("div");

    item.innerHTML = `
      <strong>${photo.athlete_name || "Unknown athlete"}</strong><br>
      Team: ${photo.team_name || "N/A"}<br>
      Jersey: ${photo.jersey_number || "N/A"}<br>
      File: ${photo.file_path}
    `;

    photoList.appendChild(item);
  });
}
