<?php
	session_start();
	require "connect.php";

	$_SESSION['meldingen'] = array();

	$valid = true;
	$id = $_POST['id'];
	$username = trim(htmlspecialchars($_POST['naam']));
	$email = trim(htmlspecialchars($_POST['email']));
	$password = trim(htmlspecialchars($_POST['wachtwoord']));
	$role = intval(trim(htmlspecialchars($_POST['rol'])));
	
	$_SESSION['gebruikerGegevens']['naam'] = $username;
	if(empty($username)){
		$valid = false;
		$_SESSION['meldingen']['naam'] = "Gebruikersnaam mag niet leeg zijn";
	}elseif(ctype_alpha(str_replace(' ', '', $name)) === false){
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
	if($role >= 1 AND $role <= 3){
		$valid = false;
		$_SESSION['meldingen']['rol'] = "Geen rol geselecteerd" . $role;
	}
				
	if($valid){
		$sql_user = "UPDATE gebruikers SET Naam='$username', Email='$email', Rol=$role WHERE Id='$id' ";
		$result_user = $conn->prepare($sql_user);
		$result_user->execute();
		
		unset($_SESSION['meldingen']);
		header ('location: ../index.php?page=gebruikers.inc.php');
	}else{
		header ('location: ../index.php?page=gebruikerWijzigen.inc.php&id=' . $id);
	}
?>