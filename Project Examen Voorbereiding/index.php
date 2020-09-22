<?php
	session_start();
	include "includes/functies.inc.php";
	
	require "php/connect.php";
?>
<html>
	<head>
		<title>Hakkers</title>
		<link rel="stylesheet" type="text/css" href="css/style.css?v=<?php echo time(); ?>">
	</head>
	
	<body>
		<?php
			include "includes/header.inc.php";
			if(isset($_GET['page'])){
				include "includes/" . $_GET['page'];
			}else{
				include "includes/login.inc.php";
			}
		?>
	</body>
</html>