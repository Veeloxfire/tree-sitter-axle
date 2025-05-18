/**
 * @file Axle grammar for tree-sitter
 * @author Thomas Hickson <veeloxfire@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "axle",

  extras: $ => [
    /[\s]/,
    $.comment
  ],

  inline: $ => [
    $.integer_type,
  ],

  rules: {
    source_file: $ => repeat(choice(
      $.declaration,
      $.import,
    )),

    import: $ => seq(
      '#import',
      $.expression,
      ';'
    ),

    declaration: $ => choice(
      $.lambda_declaration,
      $.regular_declaration,
    ),

    lambda_declaration: $ => prec(1, seq(
      optional('mut'),
      field('name', $.identifier),
      ':',
      optional($.type),
      choice(':', '='),
      $.lambda,
    )),

    regular_declaration: $ => seq(
      optional('mut'),
      $.identifier,
      ':',
      optional($.type),
      optional(seq(
        choice(':', '='),
        optional($.expression)
      )),
      ';',
    ),

    lambda: $ => seq(
      choice($.empty_lambda_header, $.param_lambda_header),
      $.block,
    ),

    empty_lambda_header: $ => seq(
      '(', ')', '->', $.type,
    ),

    param_lambda_header: $ => seq(
      '(',
      seq(optional('mut'), $.identifier, ':', $.type),
      repeat(seq(',', optional('mut'), $.identifier, ':', $.type)),
      ')', '->', $.type,
    ),


    struct_field: $ => seq(
      $.identifier,
      ':',
      $.type,
      ';',
    ),

    struct_expr: $ => seq(
      'struct',
      '{',
      repeat($.struct_field),
      '}',
    ),

    primitive_type: $ => prec(1, choice(
      'void',
      'bool',
      'ascii',
      $.integer_type,
    )),

    integer_type: $ => choice(
      'u8',
      'i8',
      'u16',
      'i16',
      'u32',
      'i32',
      'u64',
      'i64',
    ),

    pointer_type: $ => seq(
      '*',
      optional('mut'),
      $.type,
    ),

    slice_type: $ => seq(
      '[',
      ']',
      optional('mut'),
      $.type,
    ),

    tuple_type: $ => seq(
      '(',
      repeat(seq($.type, ',')),
      optional($.type),
      ')'
    ),

    array_type: $ => seq(
      '[',
      $.type,
      ';',
      $.expression,
      ']',
    ),
    
    type: $ => choice(
      $.primitive_type,
      $.pointer_type,
      $.slice_type,
      $.tuple_type,
      $.array_type,
      $.identifier,
    ),

    block: $ => seq(
      '{',
      repeat($.statement),
      '}'
    ),

    if_statement: $ => prec.left(seq(
      'if',
      '(',
      $.expression,
      ')',
      $.statement,
      optional(seq(
        'else',
        $.statement,
      ))
    )),

    while_statement: $ => seq(
      'while',
      '(',
      $.expression,
      ')',
      $.statement,
    ),

    assignment_statement: $ => seq(
      $.expression, '=', $.expression, ';'
    ),

    expression_statement: $ => seq(
      $.expression,
      ';',
    ),

    statement: $ => choice(
      $.return_statement,
      $.block,
      $.if_statement,
      $.while_statement,
      $.expression_statement,
      $.assignment_statement,
      $.declaration,
    ),

    return_statement: $ => seq(
      'return',
      optional($.expression),
      ';'
    ),

    nested_expression: $ => seq(
      '(',
      $.expression,
      ')',
    ),

    array_expression: $ => seq(
      '[',
      repeat(seq($.expression, ',')),
      optional($.expression),
      ']',
    ),

    cast_expr: $ => seq(
      'cast',
      '(',
      $.type,
      ',',
      $.expression,
      ')',
    ),

    primary: $ => choice(
      $.identifier,
      $.number,
      $.string,
      $.character,
      $.lambda,
      $.nested_expression,
      $.array_expression,
      $.struct_expr,
      $.cast_expr,
      $.type_expr,
      $.link,
      'nullptr',
    ),

    link: $ => seq(
      '#dynamic_import',
      '(',
      $.type,
      ',',
      $.string,
      ',',
      $.string,
      ')',
    ),

    type_expr: $ => seq(
      '#type',
      $.type,
    ),

    suffix_call: $ => seq(
      '(',
      optional(seq(
        $.expression,
        repeat(seq(',', $.expression))
      )),
      ')',
    ),

    suffix_index: $ => seq(
      '[',
      optional(seq(
        $.expression,
        repeat(seq(',', $.expression))
      )),
      ']',
    ),

    expression_suffix: $ => choice(
      $.suffix_call,
      $.suffix_index,
      seq('.', $.identifier),
    ),

    primary_and_suffix: $ => seq(
      $.primary,
      repeat($.expression_suffix),
    ),
    
    unop_expression: $ => choice(
      $.primary_and_suffix,
      seq('-', $.primary_and_suffix),
      seq('*', $.primary_and_suffix),
      seq('&', $.primary_and_suffix),
    ),

    binop_expression_suffix: $ => seq(
      choice(
        prec.left(3, '+'),
        prec.left(3, '-'),
        prec.left(4, '*'),
        prec.left(4, '/'),
        prec.left(4, '%'),
        prec.left(2, '<'),
        prec.left(2, '>'),
        prec.left(2, '=='),
        prec.left(2, '!='),
        prec.left(1, '|'),
        prec.left(1, '&'),
        prec.left(1, '^'),
        prec.left(4, '>>'),
        prec.left(4, '<<'),
      ),
      $.expression,
    ),
    
    binop_expression: $ => seq(
      $.unop_expression,
      optional($.binop_expression_suffix),
    ),

    expression: $ => choice(
      $.binop_expression,
    ),

    identifier: $ => seq(
      /[a-zA-Z_]/,
      /[a-zA-Z_\d]*/,
    ),

    number_suffix: $ => $.integer_type,

    number: $ => seq(
      /\d+/,
      optional(field('suffix', $.number_suffix)),
    ),

    string: $ => seq(
      '"',
      repeat(choice(
        $.string_escape_sequence,
        /[^"\r\n\\]+/
      )),
      '"',
    ),
    
    string_escape_sequence: $ => seq(
      '\\',
      choice(
        '0',
        '\\',
        'n',
        'r',
        't',
        '"',
      ),
    ),

    character: $ => seq(
      '\'',
      choice(
        /[^'\r\n\\]/,
        $.character_escape_sequence,
      ),
      '\'',
    ),
    
    character_escape_sequence: $ => seq(
      '\\',
      choice(
        '0',
        '\\',
        'n',
        'r',
        't',
        '\'',
      ),
    ),

    comment: $ => seq('//', /[^\n\r]*/), 
  }
});
