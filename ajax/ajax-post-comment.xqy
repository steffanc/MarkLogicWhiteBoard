xquery version "1.0-ml";
declare namespace ns = "http://localhost/main";
let $comName := xdmp:get-request-field("name")
let $comData := xdmp:get-request-field("com")
let $uri := xdmp:get-request-field("uri")
return
	xdmp:document-add-properties($uri, <com n="{$comName}" d="{fn:replace(fn:substring-before(xs:string(fn:current-dateTime()), "."), "T", "-")}">{$comData}</com>)
