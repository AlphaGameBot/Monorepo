import { UmamiAnalytics } from "./components/Umami";
import "./globals.css";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" >
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <UmamiAnalytics />
            </head>
            <body className="bg-gray-900 text-gray-200 font-sans antialiased min-h-screen flex flex-col justify-between  " >
                {children}
            </body>
        </html>
    );
}
