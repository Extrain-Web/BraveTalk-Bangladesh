export default function Logo({ className = "", size = "default" }) {
    const heightClass = size === "small" ? "h-8" : size === "large" ? "h-14" : "h-10";

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/images/logo.png" alt="Brave Talk Bangladesh" className={`${heightClass} w-auto ${className}`} />
    );
}
