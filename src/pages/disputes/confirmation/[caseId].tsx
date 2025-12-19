// src/pages/disputes/confirmation/[caseId].tsx
export default function DisputeConfirmationPage() {
  return (
    <div>
      <h1>✅ Dispute Filed Successfully!</h1>
      <p>Case ID: DISP-2024-089</p>
      <div className="timeline">
        <div>📨 Email confirmation sent</div>
        <div>⏳ Under review (2-3 days)</div>
        <div>📞 Verification call scheduled</div>
        <div>📝 Resolution within 10 days</div>
      </div>
      <button>Track Your Dispute</button>
    </div>
  );
}