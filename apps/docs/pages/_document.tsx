import Document, { Head, Html, Main, NextScript } from "next/document";

const devStylesheetHref = import.meta.env.DEV ? "/styles/globals.css?direct" : undefined;

export default class DocsDocument extends Document {
  override render() {
    return (
      <Html lang="en">
        <Head>
          <link href="/favicon.ico" rel="icon" sizes="any" />
          <link href="/icon.png" rel="icon" sizes="512x512" type="image/png" />
          <link href="/icon.png" rel="shortcut icon" sizes="512x512" type="image/png" />
          <link href="/icon.png" rel="apple-touch-icon" sizes="512x512" />
          {devStylesheetHref ? <link href={devStylesheetHref} rel="stylesheet" /> : null}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
