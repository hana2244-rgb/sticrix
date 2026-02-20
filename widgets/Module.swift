import ExpoModulesCore
import WidgetKit

public class ReactNativeWidgetExtensionModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ReactNativeWidgetExtension")

    Function("areActivitiesEnabled") { () -> Bool in
      return false
    }

    Function("setWidgetData") { (jsonString: String) in
      let defaults = UserDefaults(suiteName: "group.com.Akifumi.H.sticrix")
      defaults?.set(jsonString, forKey: "widgetTaskData")
      defaults?.synchronize()
      if #available(iOS 14.0, *) {
        WidgetCenter.shared.reloadAllTimelines()
      }
    }

    Function("setWidgetLabel") { (label: String) in
      let defaults = UserDefaults(suiteName: "group.com.Akifumi.H.sticrix")
      defaults?.set(label, forKey: "widgetLabel")
      defaults?.synchronize()
      if #available(iOS 14.0, *) {
        WidgetCenter.shared.reloadAllTimelines()
      }
    }
  }
}
