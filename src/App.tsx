import * as React from 'react'
import { BrowserRouter, Route, Switch, RouteComponentProps } from 'react-router-dom'
import Intro from './Intro'
import * as Sentry from '@sentry/browser'
import MapView from './MapView';
import NoScrollContainer from './NoScrollContainer';
import Fallback from './Fallback';

type Props = {
  supportsWebGl: boolean,
}

type State = {
  error: any,
}

export default class App extends React.Component<Props, State> {

  state = {
    error: null,
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.setState({ error });
    if (process.env.REACT_APP_SENTRY_DSN) {
      Sentry.withScope(scope => {
        Object.keys(errorInfo).forEach(key => {
          scope.setExtra(key, errorInfo[key]);
        })
        Sentry.captureException(error);
      })
    }
  }

  render() {
    if (this.state.error) {
      // render fallback UI
      return (
        <BrowserRouter>
          <Fallback>
            <>
              Oops… Sorry, but something went wrong.
              <p>
                <a href="#" onClick={Sentry.showReportDialog}>Click to report feedback</a>
              </p>
            </>
          </Fallback>
        </BrowserRouter>
      )
    } else {
      const { supportsWebGl } = this.props
      return (
        <BrowserRouter>
          <Switch>
            <Route
              path="/:sheetKey([a-zA-Z0-9-_]{44})"
              component={({ match }: RouteComponentProps<{ sheetKey: string }>) =>
                <NoScrollContainer>{
                  supportsWebGl ?
                    <MapView
                      spreadSheetKey={match.params.sheetKey}
                    />
                    :
                    <Fallback>
                      Sorry, but your browser doesn't seem to support WebGL which is required for this app.
                    </Fallback>
                }</NoScrollContainer>
              }
            />
            <Route path="/" component={Intro} />
          </Switch>
        </BrowserRouter>
      )
    }
  }
}

