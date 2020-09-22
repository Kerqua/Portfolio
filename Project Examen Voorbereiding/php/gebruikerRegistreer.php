<?php
	session_start();
	require "connect.php";
	
	$_SESSION['meldingen'] = array();
	$_SESSION['gebruikerGegevens'] = array();

	function GUID(){
		if (function_exists('com_create_guid') === true){
			return trim(com_create_guid(), '{}');
		}

		return sprintf('%04X%04X-%04X-%04X-%04X-%04X%04X%04X', mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(16384, 20479), mt_rand(32768, 49151), mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(0, 65535));
	}
	
	$valid = true;

	$id = GUID();
	$username = trim(htmlspecialchars($_POST['naam']));
	$email = trim(htmlspecialchars($_POST['email']));
	$password = trim(htmlspecialchars($_POST['wachtwoord']));
	$role = trim(htmlspecialchars($_POST['rol']));
	$passwordRepeat = trim(htmlspecialchars($_POST['wachtwoordHerhaal']));
	$passwordHash = password_hash($password, PASSWORD_DEFAULT);
	
	$_SESSION['gebruikerGegevens']['naam'] = $username;
	if(empty($username)){
		$valid = false;
		$_SESSION['meldingen']['naam'] = "Gebruikersnaam mag niet leeg zijn";
	}elseif(ctype_alpha(str_replace(' ', '', $username)) === false){
		$_SESSION['meldingen']['naam'] = "Gebruikersnaam mag alleen letters bevatten";
	}
	
	$_SESSION['gebruikerGegevens']['email'] = $email;
	if(empty($email)){
		$valid = false;
		$_SESSION['meldingen']['email'] = "Email mag niet leeg zijn";
	}elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
		$valid = false;
		$_SESSION['meldingen']['email'] = "Email is ongeldig";
	}
	
	$_SESSION['gebruikerGegevens']['rol'] = $role;
	if(empty($role)){
		$valid = false;
		$_SESSION['meldingen']['rol'] = "Geen rol geselecteerd" . $role;
	}
	
	if(empty($password)){
		$valid = false;
		$_SESSION['meldingen']['wachtwoord'] = "Wachtwoord mag niet leeg zijn";
	}elseif($password !== $passwordRepeat){
		$valid = false;
		$_SESSION['meldingen']['wachtwoord'] = "Wachtwoord is niet hetzelfde";
	}
	
	if($valid){
		$sql_user = "INSERT INTO gebruikers (Id, Naam, Email, Wachtwoord, Rol) VALUES ('$id', '$username', '$email', '$passwordHash', '$role')";
		$result_user = $conn->prepare($sql_user);
		$result_user->execute();
		
		unset($_SESSION['gebruikerGegevens']);
		header("Location: ../index.php?page=gebruikers.inc.php");
	}else{
		header("Location: ../index.php?page=gebruikerRegistreer.inc.php");
	}
?>