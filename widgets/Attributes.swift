import ActivityKit
import Foundation

// Stub for react-native-widget-extension plugin (Live Activity not used by this app).
// Required by the plugin; widget data is shared via App Group UserDefaults in Module.swift.
struct SticrixAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {}

    var placeholder: String = ""
}
