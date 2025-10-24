export default function Home() {
  return (
    <section
      style={{
        padding: "4rem 1rem",
        textAlign: "center",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          color: "#EA802F",
          fontSize: "2.5rem",
          marginBottom: "1rem",
          fontWeight: "700",
        }}
      >
        Welcome to Seed & Spoon 🌱
      </h1>

      <p
        style={{
          color: "#02538A",
          fontSize: "1.2rem",
          lineHeight: "1.6",
        }}
      >
        We’re a community-driven food network dedicated to fighting food
        insecurity through local partnerships, regenerative farming, and shared
        nourishment.
      </p>

      <div style={{ marginTop: "2rem" }}>
        <a
          href="/donate"
          style={{
            backgroundColor: "#EA802F",
            color: "#fff",
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          Donate a Meal
        </a>
      </div>
    </section>
  );
}
