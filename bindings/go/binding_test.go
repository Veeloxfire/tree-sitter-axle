package tree_sitter_axle_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_axle "github.com/veeloxfire/tree-sitter-axle/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_axle.Language())
	if language == nil {
		t.Errorf("Error loading Axle grammar")
	}
}
