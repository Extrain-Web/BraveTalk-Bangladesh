/**
 * Single source of truth for the certificate design (BraveTalk Bangladesh brand).
 * Returns the certificate as an HTML string (1120×790) — used BOTH by the
 * on-screen viewer (via dangerouslySetInnerHTML) and the PNG / PDF downloads
 * (html2canvas + jsPDF), so the two can never drift apart.
 *
 * The QR code is a real, scannable QR that encodes the public verification URL
 * (`${origin}/verify-certificate?id=<certificate id>`). Because rendering is
 * synchronous, generate the QR first:
 *
 *   const html = await buildCertificateHTML(cert);              // easiest
 *   // or
 *   const qrDataUrl = await generateCertificateQR(cert);
 *   renderCertificateHTML(cert, { qrDataUrl });
 *
 * Only print-safe CSS is used (solid colours + linear gradients, no filters /
 * radial gradients) so html2canvas reproduces it exactly.
 */
import { APTECH_LOGO_DATA_URI } from './certificateAssets';

// ─── Brand palette ───────────────────────────────────────────
const BLUE = '#0142b2';
const RED = '#e5251f';
const GREEN = '#027a1e';
const NAVY = '#0b1b4a';
const MUTE = '#5f6b85';
const LINE = '#d5dbe8';

const HEAD_FONT = "'Outfit','Poppins','Segoe UI',sans-serif";
const BODY_FONT = "'Work Sans','Poppins','Segoe UI',sans-serif";
const SIGN_FONT = "'Caveat','Segoe Script','Brush Script MT',cursive";

const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
};
const formatDateShort = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const escapeHtml = (v) => String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Public verification URL for a certificate. */
export function getCertificateVerifyUrl(cert = {}, origin) {
    const base = origin
        || (typeof window !== 'undefined' && window.location?.origin)
        || process.env.NEXT_PUBLIC_SITE_URL
        || '';
    return `${base.replace(/\/$/, '')}/verify-certificate?id=${encodeURIComponent(cert.id || '')}`;
}

/** PNG data-URI of a scannable QR code that opens the verification page. */
export async function generateCertificateQR(cert = {}, origin) {
    const QRCode = (await import('qrcode')).default;
    return QRCode.toDataURL(getCertificateVerifyUrl(cert, origin), {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 360, // rendered at 96px → stays crisp in the 3× html2canvas capture
        color: { dark: NAVY, light: '#ffffff' },
    });
}

/** Async convenience: QR + HTML in one call (QR failure still renders the certificate). */
export async function buildCertificateHTML(cert = {}, opts = {}) {
    let qrDataUrl = opts.qrDataUrl || '';
    if (!qrDataUrl) {
        try { qrDataUrl = await generateCertificateQR(cert, opts.origin); } catch (e) { console.error('QR generation failed', e); }
    }
    return renderCertificateHTML(cert, { ...opts, qrDataUrl });
}

export function renderCertificateHTML(cert = {}, opts = {}) {
    const { qrDataUrl = '', origin } = opts;
    const verifyUrl = getCertificateVerifyUrl(cert, origin);
    const verifyText = escapeHtml(verifyUrl.replace(/^https?:\/\//, ''));

    const studentName = escapeHtml(cert.studentName || 'Student Name');
    const courseName = escapeHtml(cert.courseName || 'Course Name');
    const batch = escapeHtml(cert.batchNumber || cert.batchId || '—');
    const certId = escapeHtml(cert.id || '—');

    // Long names shrink so they always stay on one / two neat lines
    const nameSize = studentName.length > 34 ? 38 : studentName.length > 24 ? 46 : 54;
    const courseSize = courseName.length > 60 ? 21 : courseName.length > 40 ? 24 : 28;

    const tricolor = `linear-gradient(90deg,${BLUE} 0%,${BLUE} 33.33%,${RED} 33.33%,${RED} 66.66%,${GREEN} 66.66%,${GREEN} 100%)`;

    const qrBlock = qrDataUrl
        ? `<img src="${qrDataUrl}" alt="QR code to verify this certificate" style="width:96px;height:96px;display:block;"/>`
        : `<div style="width:96px;height:96px;border:1.5px dashed ${LINE};border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:9px;color:${MUTE};">QR</div>`;

    return `
    <div style="width:1120px;height:790px;background:#ffffff;position:relative;font-family:${BODY_FONT};color:${NAVY};overflow:hidden;box-sizing:border-box;">
        <!-- brand stripes -->
        <div style="position:absolute;top:0;left:0;width:100%;height:10px;background:${tricolor};"></div>
        <div style="position:absolute;bottom:0;left:0;width:100%;height:10px;background:${tricolor};"></div>

        <!-- frame -->
        <div style="position:absolute;top:28px;left:28px;right:28px;bottom:28px;border:2px solid ${NAVY};border-radius:4px;"></div>
        <div style="position:absolute;top:36px;left:36px;right:36px;bottom:36px;border:1px solid ${LINE};border-radius:2px;"></div>

        <!-- corner accents (blue / red / green / navy) -->
        <div style="position:absolute;top:44px;left:44px;width:46px;height:46px;border-top:4px solid ${BLUE};border-left:4px solid ${BLUE};"></div>
        <div style="position:absolute;top:44px;right:44px;width:46px;height:46px;border-top:4px solid ${RED};border-right:4px solid ${RED};"></div>
        <div style="position:absolute;bottom:44px;left:44px;width:46px;height:46px;border-bottom:4px solid ${GREEN};border-left:4px solid ${GREEN};"></div>
        <div style="position:absolute;bottom:44px;right:44px;width:46px;height:46px;border-bottom:4px solid ${NAVY};border-right:4px solid ${NAVY};"></div>

        <!-- verified seal (top-right) -->
        <div style="position:absolute;top:66px;right:96px;width:92px;height:92px;border-radius:50%;background:#ffffff;border:3px solid ${BLUE};display:flex;align-items:center;justify-content:center;">
            <div style="width:76px;height:76px;border-radius:50%;border:1.5px dashed ${RED};display:flex;flex-direction:column;align-items:center;justify-content:center;">
                <img src="${APTECH_LOGO_DATA_URI}" alt="" style="width:46px;display:block;"/>
                <div style="font-family:${HEAD_FONT};font-size:7px;font-weight:800;color:${GREEN};letter-spacing:1.6px;margin-top:3px;">VERIFIED</div>
            </div>
        </div>

        <!-- content -->
        <div style="position:relative;height:100%;padding:62px 110px 56px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;text-align:center;box-sizing:border-box;">
            <!-- header -->
            <div style="width:100%;">
                <img src="${APTECH_LOGO_DATA_URI}" alt="BraveTalk Bangladesh" style="height:60px;margin:0 auto;display:block;"/>
                <div style="font-family:${HEAD_FONT};font-size:13px;font-weight:600;font-style:italic;color:${RED};letter-spacing:0.6px;margin-top:8px;">Be a Speaker, Be a Leader!</div>
                <div style="width:150px;height:3px;margin:14px auto 0;background:${tricolor};border-radius:2px;"></div>
            </div>

            <!-- body -->
            <div style="width:100%;">
                <div style="font-family:${HEAD_FONT};font-size:34px;font-weight:800;color:${NAVY};letter-spacing:7px;text-transform:uppercase;line-height:1;">Certificate</div>
                <div style="font-family:${HEAD_FONT};font-size:13px;font-weight:700;color:${BLUE};letter-spacing:6px;text-transform:uppercase;margin-top:8px;">of Completion</div>

                <div style="font-size:13px;color:${MUTE};margin-top:24px;">This certificate is proudly presented to</div>
                <div style="font-family:${HEAD_FONT};font-size:${nameSize}px;font-weight:700;color:${NAVY};letter-spacing:-0.3px;line-height:1.1;margin:10px 0 10px;">${studentName}</div>
                <div style="width:380px;height:2px;margin:0 auto;background:${tricolor};"></div>

                <div style="font-size:13px;color:${MUTE};margin-top:20px;">for successfully completing the course</div>
                <div style="font-family:${HEAD_FONT};font-size:${courseSize}px;font-weight:700;color:${BLUE};margin-top:6px;line-height:1.25;">${courseName}</div>

                <div style="display:inline-block;margin-top:16px;padding:6px 16px;border:1px solid ${LINE};border-radius:999px;font-size:12px;color:${MUTE};">
                    Batch <span style="font-weight:700;color:${NAVY};">${batch}</span>
                    <span style="margin:0 10px;color:${RED};">&bull;</span>
                    ${formatDateShort(cert.startDate)} &ndash; ${formatDateShort(cert.endDate)}
                </div>
            </div>

            <!-- footer -->
            <div style="width:100%;display:flex;justify-content:space-between;align-items:flex-end;">
                <!-- issue date + id -->
                <div style="text-align:left;width:250px;">
                    <div style="font-family:${HEAD_FONT};font-size:16px;font-weight:700;color:${NAVY};">${formatDate(cert.issueDate)}</div>
                    <div style="border-top:1.5px solid ${NAVY};margin-top:6px;padding-top:6px;font-size:9px;font-weight:700;color:${MUTE};letter-spacing:1.6px;text-transform:uppercase;">Date of Issue</div>
                    <div style="margin-top:12px;font-size:10px;color:${MUTE};">Certificate ID</div>
                    <div style="font-family:Consolas,'Courier New',monospace;font-size:12px;font-weight:700;color:${NAVY};letter-spacing:0.5px;margin-top:2px;">${certId}</div>
                </div>

                <!-- signatory -->
                <div style="text-align:center;width:280px;">
                    <div style="font-family:${SIGN_FONT};font-size:30px;font-weight:700;color:${BLUE};line-height:1;">BraveTalk Bangladesh</div>
                    <div style="border-top:1.5px solid ${NAVY};margin-top:8px;padding-top:6px;font-size:9px;font-weight:700;color:${MUTE};letter-spacing:1.6px;text-transform:uppercase;">Authorized Signatory</div>
                    <div style="font-size:10px;font-weight:600;color:${NAVY};margin-top:4px;">BraveTalk Bangladesh</div>
                </div>

                <!-- QR -->
                <div style="width:250px;display:flex;justify-content:flex-end;">
                    <div style="text-align:center;">
                        <div style="padding:5px;background:#ffffff;border:1.5px solid ${NAVY};border-radius:6px;display:inline-block;">${qrBlock}</div>
                        <div style="font-family:${HEAD_FONT};font-size:10px;font-weight:700;color:${GREEN};letter-spacing:1.4px;text-transform:uppercase;margin-top:6px;">Scan to verify</div>
                        <div style="font-size:8.5px;color:${MUTE};margin-top:2px;max-width:200px;word-break:break-all;">${verifyText}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}
