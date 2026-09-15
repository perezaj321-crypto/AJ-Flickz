const SUPABASE_URL = "https://gcdrkdlqryvjcagutyjc.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "sb_publishable_hOx4zpm2HzEO8m4wnUiDRA_RyQ-aQEM";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

let currentUser = null;

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  currentUser = data.user;
  document.getElementById("login").style.display = "none";
  document.getElementById("admin").style.display = "block";

  loadEvents();
}

async function logout() {
  await supabase.auth.signOut();
  location.reload();
}

async function createEvent() {
  const name = document.getElementById("eventName").value;
  const date = document.getElementById("eventDate").value;
  const location = document.getElementById("eventLocation").value;

  const { error } = await supabase
    .from("events")
    .insert({
      name,
      date,
      location
    });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Event created!");
  loadEvents();
}

async function loadEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const list = document.getElementById("eventList");
  list.innerHTML = "";

  data.forEach(event => {
    const item = document.createElement("div");
    item.textContent = event.name;
    list.appendChild(item);
  });
}

async function uploadPhoto() {
  const file = document.getElementById("photoFile").files[0];

  if (!file) {
    alert("Choose a photo first.");
    return;
  }

  const filePath = `${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("photos")
    .upload(filePath, file);

  if (uploadError) {
    alert(uploadError.message);
    return;
  }

  const eventId = document.getElementById("photoEvent").value;
  const athleteName = document.getElementById("athleteName").value;
  const teamName = document.getElementById("teamName").value;
  const jerseyNumber = document.getElementById("jerseyNumber").value;

  const { error: dbError } = await supabase
    .from("photos")
    .insert({
      event_id: eventId,
      athlete_name: athleteName,
      team_name: teamName,
      jersey_number: jerseyNumber,
      file_path: filePath
    });

  if (dbError) {
    alert(dbError.message);
    return;
  }

  alert("Photo uploaded!");
}
