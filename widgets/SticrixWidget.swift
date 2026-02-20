import WidgetKit
import SwiftUI

// MARK: - Data Models

struct StickyTask: Codable, Identifiable {
    let id: Int
    let text: String
    let color: String
    let order: Int
}

// MARK: - Color Definitions (matching app's STICKY_COLORS)

struct StickyColor {
    let bg: Color
    let border: Color
    let text: Color

    static let colors: [String: StickyColor] = [
        "cream":  StickyColor(bg: Color(hex: "FFF8E7"), border: Color(hex: "E8DCC4"), text: Color(hex: "5C4A32")),
        "sakura": StickyColor(bg: Color(hex: "FFE4E8"), border: Color(hex: "F5C6CB"), text: Color(hex: "8B4D5C")),
        "matcha": StickyColor(bg: Color(hex: "E8F5E9"), border: Color(hex: "C8E6C9"), text: Color(hex: "4A6B4D")),
        "sora":   StickyColor(bg: Color(hex: "E3F2FD"), border: Color(hex: "BBDEFB"), text: Color(hex: "3D5A80")),
        "fuji":   StickyColor(bg: Color(hex: "EDE7F6"), border: Color(hex: "D1C4E9"), text: Color(hex: "5E4A7D")),
        "kincha": StickyColor(bg: Color(hex: "FFF3E0"), border: Color(hex: "FFE0B2"), text: Color(hex: "8D6E4C")),
    ]

    static func forId(_ id: String) -> StickyColor {
        return colors[id] ?? colors["cream"]!
    }
}

extension Color {
    init(hex: String) {
        let scanner = Scanner(string: hex)
        var rgb: UInt64 = 0
        scanner.scanHexInt64(&rgb)
        self.init(
            red: Double((rgb >> 16) & 0xFF) / 255.0,
            green: Double((rgb >> 8) & 0xFF) / 255.0,
            blue: Double(rgb & 0xFF) / 255.0
        )
    }
}

// MARK: - Timeline Provider

struct SticrixProvider: TimelineProvider {
    func placeholder(in context: Context) -> SticrixEntry {
        SticrixEntry(date: Date(), tasks: [], label: "Important & Urgent")
    }

    func getSnapshot(in context: Context, completion: @escaping (SticrixEntry) -> Void) {
        let entry = loadEntry()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SticrixEntry>) -> Void) {
        let entry = loadEntry()
        let timeline = Timeline(entries: [entry], policy: .never)
        completion(timeline)
    }

    private func loadEntry() -> SticrixEntry {
        let defaults = UserDefaults(suiteName: "group.com.Akifumi.H.sticrix")
        let label = defaults?.string(forKey: "widgetLabel") ?? "Important & Urgent"
        var tasks: [StickyTask] = []

        if let jsonString = defaults?.string(forKey: "widgetTaskData"),
           let data = jsonString.data(using: .utf8) {
            tasks = (try? JSONDecoder().decode([StickyTask].self, from: data)) ?? []
        }

        tasks.sort { $0.order < $1.order }
        return SticrixEntry(date: Date(), tasks: tasks, label: label)
    }
}

// MARK: - Timeline Entry

struct SticrixEntry: TimelineEntry {
    let date: Date
    let tasks: [StickyTask]
    let label: String
}

// MARK: - Task Row View

struct TaskRowView: View {
    let task: StickyTask

    var body: some View {
        let stickyColor = StickyColor.forId(task.color)

        HStack(spacing: 6) {
            RoundedRectangle(cornerRadius: 2)
                .fill(stickyColor.border)
                .frame(width: 4)

            Text(task.text)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(stickyColor.text)
                .lineLimit(1)

            Spacer()
        }
        .padding(.horizontal, 6)
        .padding(.vertical, 4)
        .background(stickyColor.bg)
        .cornerRadius(4)
    }
}

// MARK: - Small Widget View

struct SticrixWidgetSmallView: View {
    let entry: SticrixEntry

    var body: some View {
        let displayTasks = Array(entry.tasks.prefix(4))

        VStack(alignment: .leading, spacing: 4) {
            Text(entry.label)
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(Color(hex: "5C4A32"))
                .lineLimit(1)
                .padding(.bottom, 2)

            if displayTasks.isEmpty {
                Spacer()
                HStack {
                    Spacer()
                    Text("No tasks")
                        .font(.system(size: 13))
                        .foregroundColor(Color(hex: "999999"))
                    Spacer()
                }
                Spacer()
            } else {
                ForEach(displayTasks) { task in
                    TaskRowView(task: task)
                }
                Spacer(minLength: 0)
            }
        }
        .padding(12)
    }
}

// MARK: - Medium Widget View

struct SticrixWidgetMediumView: View {
    let entry: SticrixEntry

    var body: some View {
        let displayTasks = Array(entry.tasks.prefix(8))
        let leftTasks = Array(displayTasks.prefix(4))
        let rightTasks = displayTasks.count > 4 ? Array(displayTasks.suffix(from: 4)) : []

        VStack(alignment: .leading, spacing: 4) {
            Text(entry.label)
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(Color(hex: "5C4A32"))
                .lineLimit(1)
                .padding(.bottom, 2)

            if displayTasks.isEmpty {
                Spacer()
                HStack {
                    Spacer()
                    Text("No tasks")
                        .font(.system(size: 13))
                        .foregroundColor(Color(hex: "999999"))
                    Spacer()
                }
                Spacer()
            } else {
                HStack(alignment: .top, spacing: 8) {
                    VStack(spacing: 4) {
                        ForEach(leftTasks) { task in
                            TaskRowView(task: task)
                        }
                        Spacer(minLength: 0)
                    }

                    if !rightTasks.isEmpty {
                        VStack(spacing: 4) {
                            ForEach(rightTasks) { task in
                                TaskRowView(task: task)
                            }
                            Spacer(minLength: 0)
                        }
                    }
                }
            }
        }
        .padding(12)
    }
}

// MARK: - Widget Definition

struct SticrixWidget: Widget {
    let kind: String = "SticrixWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SticrixProvider()) { entry in
            if #available(iOS 17.0, *) {
                ZStack {
                    LinearGradient(
                        gradient: Gradient(colors: [Color(hex: "FDFBF7"), Color(hex: "F8F4EC")]),
                        startPoint: .top,
                        endPoint: .bottom
                    )

                    SticrixWidgetEntryView(entry: entry)
                }
                .containerBackground(.clear, for: .widget)
            } else {
                ZStack {
                    LinearGradient(
                        gradient: Gradient(colors: [Color(hex: "FDFBF7"), Color(hex: "F8F4EC")]),
                        startPoint: .top,
                        endPoint: .bottom
                    )

                    SticrixWidgetEntryView(entry: entry)
                }
            }
        }
        .configurationDisplayName("Sticrix")
        .description("Important & Urgent tasks")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct SticrixWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: SticrixEntry

    var body: some View {
        switch family {
        case .systemMedium:
            SticrixWidgetMediumView(entry: entry)
        default:
            SticrixWidgetSmallView(entry: entry)
        }
    }
}
