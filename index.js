import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "Silmarilli10",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  const result = await db.query("SELECT country_code FROM visited_country");
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  console.log(result.rows);
  res.render("index.ejs", { countries: countries, total: countries.length });
});

app.post("/add", async (req, res) => {
  const input = req.body["country"];
  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%'",
      [input.toLowerCase()]
    );
    const data = result.rows[0];
    const conutryCode = data.country_code;
    try {
      await db.query("INSERT INTO visited_country (country_code) VALUES ($1)", [
        conutryCode,
      ]);
      res.redirect("/");
    } catch (error) {
      const result = await db.query("SELECT country_code FROM visited_country");
      let countries = [];
      result.rows.forEach((country) => {
        countries.push(country.country_code);
      });
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country has already been added, try again.",
      });
    }
  } catch (error) {
    const result = await db.query("SELECT country_code FROM visited_country");
    let countries = [];
    result.rows.forEach((country) => {
      countries.push(country.country_code);
    });
    console.log(result.rows);
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country name does not exist, try again.",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
