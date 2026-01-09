import React, { useEffect, useState } from "react";
import HillChart, {
  type EpicDot,
  type HillPhase,
  computePhase,
} from "./HillChart";
   const STORAGE_KEY = "hillChartEpics_v1";

   function loadInitialEpics(): EpicDot[] {
     if (typeof window !== "undefined") {
       try {
         const raw = window.localStorage.getItem(STORAGE_KEY);
         if (raw) {
           return JSON.parse(raw) as EpicDot[];
         }
       } catch {
         // ignore parse errors
       }
     }

     // Seed with a few example Epics – replace with your real Jira keys/titles
     return [
       { key: "MOB-101", title: "Mobile onboarding revamp", x: 10 },
       { key: "WEB-202", title: "Teacher messaging improvements", x: 35 },
       { key: "INFRA-303", title: "Notifications reliability", x: 65 },
     ];
   }

   function phaseLabel(phase: HillPhase): string {
     switch (phase) {
       case "UPHILL":
         return "Uphill – still figuring it out";
       case "CREST":
         return "Crest – approach is clear";
       case "DOWNHILL":
         return "Downhill – executing";
       case "DONE":
         return "Done / rollout";
     }
   }

   const App: React.FC = () => {
     const [epics, setEpics] = useState<EpicDot[]>(() => loadInitialEpics());

     useEffect(() => {
       try {
         window.localStorage.setItem(STORAGE_KEY, JSON.stringify(epics));
       } catch {
         // ignore write errors
       }
     }, [epics]);

     const handleUpdateEpicX = (key: string, x: number) => {
       setEpics((prev) => prev.map((e) => (e.key === key ? { ...e, x } : e)));
     };

     const handleAddEpic = () => {
       const key = window.prompt("Enter Jira Epic key (e.g. PROJ-123):");
       if (!key) return;
       const title = window.prompt("Short title for this Epic (for you):") || key;
       setEpics((prev) => [...prev, { key: key.trim(), title: title.trim(), x: 5 }]);
     };

     const handleRemoveEpic = (key: string) => {
       if (!window.confirm(`Remove ${key} from this hill?`)) return;
       setEpics((prev) => prev.filter((e) => e.key !== key));
     };

     return (
       <div
         style={{
           fontFamily:
             '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
           padding: 24,
           maxWidth: 1100,
           margin: "0 auto",
         }}
       >
         <h2 style={{ marginBottom: 8 }}>Team Hill Chart (local prototype)</h2>
         <p style={{ marginBottom: 16, color: "#4b5563" }}>
           Drag dots along the hill to reflect where each Epic is. Keep Jira open on another
           screen and adjust positions weekly.
         </p>

         <HillChart epics={epics} onUpdateEpicX={handleUpdateEpicX} />

         <div style={{ marginTop: 24, display: "flex", gap: 24, alignItems: "flex-start" }}>
           <div style={{ flex: 2 }}>
             <h3 style={{ marginBottom: 8 }}>Epics on this hill</h3>
             <button
               type="button"
               onClick={handleAddEpic}
               style={{
                 padding: "6px 12px",
                 borderRadius: 4,
                 border: "1px solid #4b6fff",
                 background: "#4b6fff",
                 color: "white",
                 fontSize: 13,
                 cursor: "pointer",
                 marginBottom: 12,
               }}
             >
               + Add Epic
             </button>
             <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
               <thead>
                 <tr>
                   <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", padding: 4 }}>
                     Key
                   </th>
                   <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", padding: 4 }}>
                     Title
                   </th>
                   <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", padding: 4 }}>
                     Position
                   </th>
                   <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", padding: 4 }}>
                     Phase
                   </th>
                   <th style={{ borderBottom: "1px solid #e5e7eb" }} />
                 </tr>
               </thead>
               <tbody>
                 {epics.map((e) => {
                   const phase = computePhase(e.x);
                   return (
                     <tr key={e.key}>
                       <td style={{ padding: 4 }}>{e.key}</td>
                       <td style={{ padding: 4 }}>{e.title}</td>
                       <td style={{ padding: 4 }}>{e.x.toFixed(0)}%</td>
                       <td style={{ padding: 4 }}>{phaseLabel(phase)}</td>
                       <td style={{ padding: 4 }}>
                         <button
                           type="button"
                           onClick={() => handleRemoveEpic(e.key)}
                           style={{
                             border: "none",
                             background: "transparent",
                             color: "#b91c1c",
                             cursor: "pointer",
                           }}
                         >
                           Remove
                         </button>
                       </td>
                     </tr>
                   );
                 })}
                 {epics.length === 0 && (
                   <tr>
                     <td colSpan={5} style={{ padding: 8, color: "#6b7280" }}>
                       No Epics yet. Use “Add Epic” and copy keys from Jira.
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>

           <div style={{ flex: 1 }}>
             <h3 style={{ marginBottom: 8 }}>How to use with Jira (manually)</h3>
             <ol style={{ fontSize: 13, color: "#4b5563", paddingLeft: 18 }}>
               <li>Open your Jira board with Epics visible.</li>
               <li>For each Epic you care about, add it here via “Add Epic”.</li>
               <li>
                 In your weekly review, drag each dot along the hill based on discussion
                 (“how confident are we / where are the unknowns?”).
               </li>
               <li>
                 Local positions are saved in your browser, so next week you can show how
                 dots moved (progress) just by reopening this page.
               </li>
             </ol>
           </div>
         </div>
       </div>
     );
   };

   export default App;