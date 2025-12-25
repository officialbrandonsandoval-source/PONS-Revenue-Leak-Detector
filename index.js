import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());

// Allow all origins for demo flexibility
app.use(cors({
  origin: "*"
}));

app.options("*", cors());

// HEALTH CHECK
app.get("/", (req, res) => {
  res.send("PONS API OK");
});

// AUDIT ENDPOINT
app.post("/audit", (req, res) => {
  // Simulating a slight delay for realism
  setTimeout(() => {
    res.json({
      generated_at: new Date().toISOString(),
      leaks: [
        {
          id: "unworked_high_intent_leads",
          severity: "CRITICAL",
          revenue_at_risk: 21500,
          cause: "2 inbound leads untouched for over 36 hours",
          recommended_action: "Call top 5 inbound leads immediately",
          time_sensitivity: "Delay >48h reduces recovery odds by ~60%",
          priority_score: 34400,
        },
        {
          id: "contract_stalled_legal",
          severity: "MEDIUM",
          revenue_at_risk: 55000,
          cause: "Contract in legal review > 7 days",
          recommended_action: "Ping Legal Counsel for status update",
          time_sensitivity: "End of quarter risk",
          priority_score: 22000,
        }
      ],
    });
  }, 800);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`PONS API listening on ${port}`);
});