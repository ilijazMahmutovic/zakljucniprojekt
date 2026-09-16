process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const cors = require("cors");

require("dotenv").config();

console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_KEY exists:", !!process.env.SUPABASE_KEY);
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const app = express();
app.use(cors());
const PORT = 2500;

app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

app.get("/uporabniki", async (req, res) => {
    const { data, error } = await supabase
        .from("uporabniki")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});

app.get("/tickets", async (req, res) => {
    const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});

app.get("/oprema", async (req, res) => {
    const { data, error } = await supabase
        .from("oprema")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});


app.get("/zgodovina_ticketov", async (req, res) => {
    const { data, error } = await supabase
        .from("zgodovina_ticketov")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});





app.post("/tickets", async (req, res) => {
    console.log("Content-Type received:", req.headers["content-type"]);
    console.log("Body received:", req.body);
    const {
        naslov,
        opis,
        lokacija,
        prioriteta,
        status,
        prijavitelj,
        datum,
        resitev
    } = req.body;

    const {
        data,
        error
    } = await supabase
        .from("tickets")
        .insert ({naslov, opis, lokacija, prioriteta, status, prijavitelj, datum, resitev})
        .select();
    if (error) {
        return res.status(500).json({ error: error.message });
}
    res.status(201).json(data);});

app.delete("/tickets/:id", async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from("tickets")
        .delete()
        .eq("id", id)
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data);
});