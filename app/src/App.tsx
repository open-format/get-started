import * as React from "react";
import Leaderboard from "components/Leaderboard";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Welcome from "components/Welcome";

import "./styles/global.css";

export default () => {
  return (
    <Router>
      <Switch>
        {/* Define the route for the welcome page */}
        <Route path="/welcome" component={Welcome} />

        {/* The default route */}
        <Route path="/">
          <h1>Welcome to OPENFORMAT GetStarted!</h1>
          <Leaderboard />
        </Route>
      </Switch>
    </Router>
  );
};
