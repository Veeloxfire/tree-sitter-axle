(
  lambda_declaration name: (identifier) @function
  (#set! "priority" 105)
)

(identifier) @variable

(number) @number
(number suffix: (number_suffix) @number)

[
  "struct"
  "mut"
  "void"
  "nullptr"
  "if"
  "else"
  "while"
  "return"
  "cast"
] @keyword

(type) @type

[
  ";"
  "."
  ","
] @punctuation.delimiter

[
  "-"
  "&"
  "+"
  "<"
  "<<"
  "="
  "=="
  "!="
  ">"
  ">>"
  "|"
  "^"
  "*"
  "/"
  "%"
] @operator

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
]  @punctuation.bracket
