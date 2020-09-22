<?php 
	session_start();
	require "connect.php";
	require "../includes/functies.inc.php";
	
	if(isset($_POST['naam']) and $_POST['wachtwoord'] != ""){
		$username = $_POST['naam'];
		$password = $_POST['wachtwoord'];
		$sql_count = "SELECT COUNT(*) FROM gebruikers WHERE Naam='$username'";
		$result_count = $conn->prepare($sql_count);
		$result_count->execute();
		
		if($result_count->fetchColumn() == "1"){
			$sql_user = "SELECT * FROM gebruikers WHERE Naam='$username'";
			$result_user = $conn->prepare($sql_user);
			$result_user->execute();
			$user = $result_user->fetch(PDO::FETCH_ASSOC);
			if(password_verify($password, $user['Wachtwoord'])){
				//$_SESSION["User"] = new User($user['Naam'], $user['Rol'], $user['Id']);
				Login($user['Naam'],$user['Rol'],$user['Id']);
				header ('location: ../index.php?page=gebruikers.inc.php');
			}else{
				$_SESSION["message"] = "Combinatie username / password is niet bekend";
				header ('location: ../index.php?page=login.inc.php');
			}
		}else{
			$_SESSION["message"] = "Combinatie username / password is niet bekend";
			header ('location: ../index.php?page=login.inc.php');
		}
	}
?>