import { AlertOptions, setState } from "../store/state";

export class AlertsService {
  static addAlert(alert: AlertOptions) {
    setState("alerts", (alerts) => [...alerts, alert]);

    setTimeout(() => {
      setState("alerts", (alerts) => alerts.filter((_, i) => alert !== alert));
    }, 5000);
  }

  static clearAlert(index: number) {
    setState("alerts", (alerts) => alerts.filter((_, i) => i !== index));
  }

  static clearAlerts() {
    setState("alerts", []);
  }
}
