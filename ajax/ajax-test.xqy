xquery version "1.0-ml";
declare namespace ns = "http://localhost/main";
let $test := xdmp:get-request-field("stuff")
return $test
