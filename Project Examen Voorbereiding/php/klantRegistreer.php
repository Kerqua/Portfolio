<?php
	require "connect.php";

	function GUID(){
		if (function_exists('com_create_guid') === true){
			return trim(com_create_guid(), '{}');
		}

		return sprintf('%04X%04X-%04X-%04X-%04X-%04X%04X%04X', mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(16384, 20479), mt_rand(32768, 49151), mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(0, 65535));
	}
	
	if(isset($_POST['voornaam'])){
		$valid = true;
				
		$id = GUID();
		$firstname = trim(htmlspecialchars($_POST['voornaam']));
		$lastname = trim(htmlspecialchars($_POST['achternaam']));
		$insertion = trim(htmlspecialchars($_POST['tussenvoegsel']));
		$email = trim(htmlspecialchars($_POST['email']));
		$residence = trim(htmlspecialchars($_POST['woonplaats']));
		$street = trim(htmlspecialchars($_POST['straat']));
		$houseNumber = trim(htmlspecialchars($_POST['huisnummer']));
		$zipcode = trim(htmlspecialchars($_POST['postcode']));
		$phoneNumber = trim(htmlspecialchars($_POST['telefoonnummer']));
		
		$_SESSION['klantenGegevens']['voornaam'] = $firstname;
		if(empty($firstname)){
			$valid = false;
			$_SESSION['meldingen']['voornaam'] = "Voornaam mag niet leeg zijn";
		}elseif(ctype_alpha(str_replace(' ', '', $firstname)) === false){
			$_SESSION['meldingen']['voornaam'] = "Voornaam mag alleen letters bevatten";
		}

		$_SESSION['klantenGegevens']['achternaam'] = $lastname;
		if(empty($lastname)){
			$valid = false;
			$_SESSION['meldingen']['achternaam'] = "Achternaam mag niet leeg zijn";
		}elseif(ctype_alpha(str_replace(' ', '', $lastname)) === false){
			$_SESSION['meldingen']['achternaam'] = "Achternaam mag alleen letters bevatten";
		}

		$_SESSION['klantenGegevens']['tussenvoegsel'] = $insertion;
		if(empty($insertion)){
			
		}elseif(ctype_alpha(str_replace(' ', '', $insertion)) === false){
			$_SESSION['meldingen']['tussenvoegsel'] = "Tussenvoegsel mag alleen letters bevatten";
		}

		$_SESSION['klantenGegevens']['email'] = $email;
		if(empty($email)){
			$valid = false;
			$_SESSION['meldingen']['email'] = "Email mag niet leeg zijn";
		}elseif(!filter_var($email, FILTER_VALIDATE_EMAIL)){
			$valid = false;
			echo "Email is ongeldig";
		}

		$_SESSION['klantenGegevens']['woonplaats'] = $residence;
		if(empty($residence)){
			$valid = false;
			$_SESSION['meldingen']['woonplaats'] = "Woonplaats mag niet leeg zijn";
		}elseif(ctype_alpha(str_replace(' ', '', $residence)) === false){
			$_SESSION['meldingen']['woonplaats'] = "Woonplaats mag alleen letters bevatten";
		}

		$_SESSION['klantenGegevens']['straat'] = $street;
		if(empty($street)){
			$valid = false;
			$_SESSION['meldingen']['straat'] = "Straat mag niet leeg zijn";
		}elseif(ctype_alpha(str_replace(' ', '', $street)) === false){
			$_SESSION['meldingen']['straat'] = "Straat mag alleen letters bevatten";
		}

		$_SESSION['klantenGegevens']['huisnummer'] = $houseNumber;
		if(empty($houseNumber)){
			$valid = false;
			$_SESSION['meldingen']['huisnummer'] = "Huisnummer mag niet leeg zijn";
		}

		$_SESSION['klantenGegevens']['postcode'] = $zipcode;
		if(empty($zipcode)){
			$valid = false;
			$_SESSION['meldingen']['postcode'] = "Postcode mag niet leeg zijn";
		}else{
			$regex = "/^\d{4}[A-Z]{2}$/";
			if(!preg_match($zipcode, $zipcode)) {
				$valid = false;
				$_SESSION['meldingen']['postcode'] = "Postcode mag niet leeg zijn";
			}
		}

		$_SESSION['klantenGegevens']['telefoonnummer'] = $phoneNumber;
		if(empty($phoneNumber)){
			$valid = false;
			$_SESSION['meldingen']['telefoonnummer'] = "Telefoonnummer mag niet leeg zijn";
		}elseif(!(strlen($phoneNumber)==10 && ctype_digit($phoneNumber))){
			$valid = false;
			$_SESSION['meldingen']['telefoonnummer'] = "Telefoonnummer is niet geldig";
		}
		
		if($valid){
			$sql_user = "INSERT INTO klanten (Id, Voornaam, Achternaam, Tussenvoegsel, Email, Woonplaats, Straat, Huisnummer, Postcode, Telefoonnummer) VALUES ('$id', '$firstname', '$lastname', '$insertion', '$email', '$residence', '$street', '$houseNumber', '$zipcode', '$phoneNumber')";
			$result_user = $conn->prepare($sql_user);
			$result_user->execute();
			
			unset($_SESSION['klantenGegevens']);
			header("Location: ../index.php?page=klanten.inc.php");
		}

		else{
			header("Location: ../index.php?page=klantRegistreer.inc.php");
		}
	}
?>