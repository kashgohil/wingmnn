package main

import (
	"bytes"
	"fmt"
	"go/ast"
	"go/format"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"strings"
)

type commonFields struct {
	Name string
	Type string
	Tag  string
}

var fields = []commonFields{
	{
		Name: "Deleted",
		Type: "bool",
		Tag:  `json:"deleted" db:"deleted" ignore:"true"`,
	},
	{
		Name: "UpdatedBy",
		Type: "string",
		Tag:  `json:"updatedBy" db:"updated_by" ignore:"true"`,
	},
	{
		Name: "CreatedBy",
		Type: "string",
		Tag:  `json:"createdBy" db:"created_by" ignore:"true"`,
	},
	{
		Name: "UpdatedAt",
		Type: "int64",
		Tag:  `json:"updatedAt" db:"updated_at" ignore:"true"`,
	},
	{
		Name: "CreatedAt",
		Type: "int64",
		Tag:  `json:"createdAt" db:"created_at" ignore:"true"`,
	},
}

func main() {
	// walk through all the files, directories and subdirectories
	filepath.Walk(".", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && strings.HasSuffix(path, ".go") && !strings.HasSuffix(path, ".test.go") {
			return processFile(path)
		}
		return nil
	})
}

func processFile(filename string) error {
	fset := token.NewFileSet()
	node, err := parser.ParseFile(fset, filename, nil, parser.ParseComments)
	if err != nil {
		return fmt.Errorf("parsing file %s: %v", filename, err)
	}

	modified := false

	for _, decl := range node.Decls {
		genDecl, ok := decl.(*ast.GenDecl)
		if !ok {
			continue
		}

		for _, spec := range genDecl.Specs {
			typeSpec, ok := spec.(*ast.TypeSpec)
			if !ok {
				continue
			}

			structType, ok := typeSpec.Type.(*ast.StructType)
			if !ok {
				continue
			}

			// Check if struct has @common_fields comment
			if genDecl.Doc != nil && hasCommonFieldsTag(genDecl.Doc) {
				modified = true
				updateStructFields(structType)
				// Remove the @common_fields directive from comments
				removeCommonFieldsDirective(genDecl.Doc)
			}
		}
	}

	if !modified {
		return nil
	}

	// Format and write the modified file
	var buf bytes.Buffer
	if err := format.Node(&buf, fset, node); err != nil {
		return fmt.Errorf("formatting file %s: %v", filename, err)
	}

	if err := os.WriteFile(filename, buf.Bytes(), 0644); err != nil {
		return fmt.Errorf("writing file %s: %v", filename, err)
	}

	fmt.Printf("Updated %s\n", filename)
	return nil
}

func hasCommonFieldsTag(doc *ast.CommentGroup) bool {
	for _, comment := range doc.List {
		if strings.Contains(comment.Text, "@common_fields") {
			return true
		}
	}
	return false
}

func removeCommonFieldsDirective(doc *ast.CommentGroup) {
	newComments := make([]*ast.Comment, 0)
	for _, comment := range doc.List {
		if !strings.Contains(comment.Text, "@common_fields") {
			newComments = append(newComments, comment)
		}
	}

	// If there are other comments, keep them
	if len(newComments) > 0 {
		doc.List = newComments
	} else {
		// If @common_fields was the only comment, remove the entire comment group
		doc.List = nil
	}
}

func updateStructFields(structType *ast.StructType) {
	// Create new fields slice with common fields
	newFields := make([]*ast.Field, 0, len(fields)+len(structType.Fields.List))

	// Add existing fields, excluding any that match common field names
	for _, field := range structType.Fields.List {
		if len(field.Names) > 0 {
			shouldAdd := true
			for _, cf := range fields {
				if field.Names[0].Name == cf.Name {
					shouldAdd = false
					break
				}
			}
			if shouldAdd {
				newFields = append(newFields, field)
			}
		}
	}

	// Add common fields
	for _, cf := range fields {
		field := &ast.Field{
			Names: []*ast.Ident{ast.NewIdent(cf.Name)},
			Type:  ast.NewIdent(cf.Type),
			Tag:   &ast.BasicLit{Kind: token.STRING, Value: "`" + cf.Tag + "`"},
		}
		newFields = append(newFields, field)
	}

	structType.Fields.List = newFields
}
