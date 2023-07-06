import * as React from 'react';
import { messageHandler } from '@estruyf/vscode/dist/client';
import "./styles.css";
import * as l10n from '@vscode/l10n'

export interface IAppProps { }

export const App: React.FunctionComponent<IAppProps> = ({ }: React.PropsWithChildren<IAppProps>) => {
  const [message, setMessage] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");
  const [ready, setIsReady] = React.useState<boolean>(false);

  const sendMessage = () => {
    messageHandler.send('POST_DATA', { msg: 'Hello from the webview' });
  };

  const requestData = () => {
    messageHandler.request<string>('GET_DATA').then((msg) => {
      setMessage(msg);
    });
  };

  const requestWithErrorData = () => {
    messageHandler.request<string>('GET_DATA_ERROR')
      .then((msg) => {
        setMessage(msg);
      })
      .catch((err) => {
        setError(err);
      });
  };

  React.useEffect(() => {
    messageHandler.request<string | undefined>('GET_LOCALIZATION')
      .then((fileContents) => {
        if (fileContents) {
          l10n.config({
            contents: fileContents
          })

          setIsReady(true);
        }
      }).catch((err) => {
        // On error, we can still continue with the default language
        setIsReady(true);
      });
  }, []);

  if (!ready) {
    return <div className='app'>"Loading..."</div>;
  }

  return (
    <div className='app'>
      <h1>{l10n.t("Hello from the React Webview Starter")}</h1>

      <div className='app__actions'>
        <button onClick={sendMessage}>
          {l10n.t("Send message to extension")}
        </button>

        <button onClick={requestData}>
          {l10n.t("Get data from extension")}
        </button>

        <button onClick={requestWithErrorData}>
          {l10n.t("Get data from extension with error")}
        </button>
      </div>

      {message && <p><strong>{l10n.t("Message from the extension")}</strong>: {message}</p>}

      {error && <p className='app__error'><strong>{l10n.t("ERROR")}</strong>: {error}</p>}
    </div>
  );
};