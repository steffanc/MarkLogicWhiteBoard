xquery version "1.0-ml";
declare namespace ns = "http://localhost/main";
declare function local:result-controller() {
	let $searchCommentNames := xdmp:get-request-field("commentNames")
	let $searchComments := xdmp:get-request-field("commentText")
	let $searchFileNames := xdmp:get-request-field("fileNames")
	let $searchText := xdmp:get-request-field("text")
	let $queryString := xdmp:get-request-field("searchWord")

	let $docQuery := cts:element-query(xs:QName("t"), $queryString)

	let $propQuery := cts:or-query((
		cts:element-attribute-word-query(xs:QName("com"), xs:QName("n"), $queryString),
		cts:element-query(xs:QName("com"), $queryString),
		cts:element-query(xs:QName("on"), $queryString)
	))

	for $i in (
		cts:search(fn:doc()/text/t, $docQuery),
		cts:search(xdmp:document-properties(), $propQuery)
	)
	let $uri := base-uri($i)
	order by tokenize(base-uri($i), "/")[2]
	return
	(
		<div>Board Name: {fn:tokenize($uri, "/")[2]}</div>
		,
		if (fn:compare(fn:tokenize($uri, "/")[1], "images") eq 0)
		then
			if(fn:compare($searchFileNames, "true") eq 0 or fn:compare($searchCommentNames, "true") eq 0 or fn:compare($searchComments, "true") eq 0)
			then
				<div>
					<img src="get-image.xqy?uri={$i/prop:properties/u/text()}"></img>
					<div>Image Name: {$i/prop:properties/on/text()}</div>
					<div>Coordinates: x={$i/prop:properties/x/text()}, y={$i/prop:properties/y/text()}</div>
				{
					for $j in $i/prop:properties/com
					return
						if ((fn:compare($searchCommentNames, "true") eq 0 and fn:contains($j/@n, $queryString))
							or
							(fn:compare($searchComments, "true") eq 0 and fn:contains($j/text(), $queryString)))
						then
							<div>Name: "{fn:data($j/@n)}" Date: {fn:data($j/@d)} Comment: "{$j/text()}"</div>
					else
						()
				}
				<br/>
				</div>
			else
				()
		else if(fn:compare(fn:tokenize($uri, "/")[1], "text") eq 0
			and fn:compare($searchText, "true") eq 0)
		then
			<div>{$i}<br/><br/></div>
		else
			()
	)
};

xdmp:set-response-content-type("text/html; charset=utf-8"),
'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <title>Search</title>
        <link href="/css/jquery-ui.css" rel="stylesheet" type="text/css"/>
		<script type="text/javascript" src="javascript/jquery-1.4.2.min.js"></script>
		<script type="text/javascript" src="javascript/jquery-ui.min.js"></script>
    </head>
    <body>
{
	local:result-controller()
}
    </body>
</html>
