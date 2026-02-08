import { type NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    // Get the CV page URL
    const baseUrl = request.nextUrl.origin;

    // For now, we'll return a redirect to the existing PDF
    // In a production environment, you would use a headless browser service
    // like Puppeteer, Playwright, or a service like Browserbase to generate the PDF
    return NextResponse.json(
      {
        message:
          "PDF generation is handled by the browser print functionality. Please use the Print or Download button.",
        pdfUrl: `${baseUrl}/pdf`,
      },
      { status: 200 }
    );

    // Alternative: If you have a pre-generated PDF, return it
    // const pdfBuffer = await fetch(`${baseUrl}/duyet.cv.pdf`).then(res => res.arrayBuffer());
    // return new NextResponse(pdfBuffer, {
    //   headers: {
    //     'Content-Type': 'application/pdf',
    //     'Content-Disposition': 'attachment; filename="duyet-le-resume.pdf"',
    //   },
    // });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
