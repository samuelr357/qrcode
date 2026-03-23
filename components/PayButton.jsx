"use client";

export default function PayButton({ label = "Assinar agora" }) {
  const handlePay = async () => {
    const button = document.getElementById("pay-button");
    if (button) {
      button.disabled = true;
      button.textContent = "Abrindo checkout...";
    }
    try {
      const response = await fetch("/api/payments/checkout", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao iniciar checkout");
      window.location.href = data.redirectUrl;
    } catch (error) {
      alert(error.message);
      if (button) {
        button.disabled = false;
        button.textContent = label;
      }
    }
  };

  return (
    <button id="pay-button" className="btn" type="button" onClick={handlePay}>
      {label}
    </button>
  );
}
