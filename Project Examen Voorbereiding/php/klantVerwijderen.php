<?php
	require "connect.php";

	$id = $_GET['id'];
	$sql = "DELETE FROM klanten WHERE Id='$id'";
	$result= $conn->prepare($sql);
	$result ->execute();

	header ('location: ../index.php?page=klanten.inc.php');
?>