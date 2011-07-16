xquery version "1.0-ml";
declare namespace ns = "http://localhost/main";
let $sentData := xdmp:get-request-body("binary")
let $origFileName := xdmp:get-request-header("filename")
let $name := fn:substring-before($origFileName, ".")
let $ext := fn:substring-after($origFileName, ".")
let $newFileName := fn:concat($name, xdmp:random(), ".", $ext)
let $boardDir := fn:concat(xdmp:get-request-header("board"), "/")
let $filePath :=  fn:concat("images/", $boardDir, $newFileName)
let $xCoord := xdmp:get-request-header("x")
let $yCoord := xdmp:get-request-header("y")
return
(
	xdmp:document-insert($filePath, $sentData)
	,
	xdmp:document-set-properties($filePath, (<u>{$filePath}</u>, <on>{$origFileName}</on>, <x>{$xCoord}</x>, <y>{$yCoord}</y>, <z>0</z>))
)
