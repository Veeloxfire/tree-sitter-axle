import XCTest
import SwiftTreeSitter
import TreeSitterAxle

final class TreeSitterAxleTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_axle())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Axle grammar")
    }
}
