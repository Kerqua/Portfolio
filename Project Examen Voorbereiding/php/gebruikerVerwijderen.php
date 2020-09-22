<?php
	require "connect.php";

	$id = $_GET['id'];
	$sql = "DELETE FROM gebruikers WHERE Id='$id'";
	$result= $conn->prepare($sql);
	$result ->execute();

	header ('location: ../index.php?page=gebruikers.inc.php');
?>