<?php
	session_start();
	$valid = true;
		
	$_SESSION['meldingen'] = array();

	$id = $_POST['id'];
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
		$valid = false;
		$_SESSION['meldingen']['voornaam'] = "Voornaam mag alleen letters bevatten";
	}

	$_SESSION['klantenGegevens']['achternaam'] = $lastname;
	if(empty($lastname)){
		$valid = false;
		$_SESSION['meldingen']['achternaam'] = "Achternaam mag niet leeg zijn";
	}elseif(ctype_alpha(str_replace(' ', '', $lastname)) === false){
		$valid = false;
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
		$_SESSION['meldingen']['email'] = "Email is ongeldig";
	}

	$_SESSION['klantenGegevens']['woonplaats'] = $residence;
	if(empty($residence)){
		$valid = false;
		$_SESSION['meldingen']['woonplaats'] = "Woonplaats mag niet leeg zijn";
	}elseif(ctype_alpha(str_replace(' ', '', $residence)) === false){
		$valid = false;
		$_SESSION['meldingen']['woonplaats'] = "Woonplaats mag alleen letters bevatten";
	}

	$_SESSION['klantenGegevens']['straat'] = $street;
	if(empty($street)){
		$valid = false;
		$_SESSION['meldingen']['straat'] = "Straat mag niet leeg zijn";
	}elseif(ctype_alpha(str_replace(' ', '', $street)) === false){
		$valid = false;
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
		$regex = "/^\d{4}[A-Z]{2}$//";
		if(!preg_match($regex, $zipcode)) {
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
		$sql_customer = "UPDATE klanten (Id, Voornaam, Achternaam, Tussenvoegsel, Email, Woonplaats, Straat, Huisnummer, Postcode, Telefoonnummer) VALUES ('$id', '$firstname', '$lastname', '$insertion', '$email', '$residence', '$street', '$houseNumber', '$zipcode', '$phoneNumber')";
		$result_customer = $conn->prepare($sql_customer);
		$result_customer->execute();
		
		unset($_SESSION['klantenGegevens']);
		header("Location: ../index.php?page=klanten.inc.php");
	}
	else{
		$_SESSION['meldingen']['voornaam'] = "Voornaam mag niet leeg zijn";
		header("Location: ../index.php?page=klantWijzigen.inc.php&id=" . $id);
	}
?>

<?php /*
	session_start();
	require "connect.php";

	$_SESSION['meldingen'] = array();

	$id = GUID();
	$firstname = $_POST['voornaam'];
	$lastname = $_POST['achternaam'];
	$insertion = $_POST['tussenvoegsel'];
	$email = $_POST['email'];
	$residence = $_POST['woonplaats'];
	$street = $_POST['straat'];
	$houseNumber = $_POST['huisnummer'];
	$zipcode = $_POST['postcode'];
	$phoneNumber = $_POST['telefoonnummer'];
	
	if($firstname == ""){
		$valid = false;
		$_SESSION['meldingen']['voornaam'] = "Voornaam mag niet leeg zijn";
	}else{
		$_SESSION['klantenGegevens']['naam'] = $firstname;
	}

	if($lastname == ""){
		$valid = false;
		$_SESSION['meldingen']['achternaam'] = "Achternaam mag niet leeg zijn";
	}else{
		$_SESSION['klantenGegevens']['naam'] = $lastname;
	}

	if($insertion == ""){
		}else{
		$_SESSION['klantenGegevens']['naam'] = $firstname;
	}

	if($email == ""){
		$valid = false;
		$_SESSION['meldingen']['email'] = "Email mag niet leeg zijn";
	}elseif(!filter_var($email, FILTER_VALIDATE_EMAIL)){
		$valid = false;
		echo "Email is ongeldig";
	}else{
		$_SESSION['klantenGegevens']['email'] = $email;
	}

	if($residence == ""){
		$valid = false;
		$_SESSION['meldingen']['woonplaats'] = "Woonplaats mag niet leeg zijn";
	}else{
		$_SESSION['klantenGegevens']['woonplaats'] = $residence;
	}

	if($street == ""){
		$valid = false;
		$_SESSION['meldingen']['straat'] = "Straat mag niet leeg zijn";
	}else{
		$_SESSION['klantenGegevens']['straat'] = $street;
	}

	if($houseNumber == ""){
		$valid = false;
		$_SESSION['meldingen']['huisnummer'] = "Huisnummer mag niet leeg zijn";
	}else{
		$_SESSION['klantenGegevens']['huisnummer'] = $houseNumber;
	}

	if($zipcode == ""){
		$valid = false;
		$_SESSION['meldingen']['postcode'] = "Huisnummer mag niet leeg zijn";
	}else{
		$_SESSION['klantenGegevens']['postcode'] = $zipcode;
	}

	if($phoneNumber == ""){
		$valid = false;
		$_SESSION['meldingen']['telefoonnummer'] = "Telefoonnummer mag niet leeg zijn";
	}else{
		$_SESSION['klantenGegevens']['telefoonnummer'] = $phoneNumber;
	}
	
	if($valid){
		$sql_customer = "UPDATE klanten SET Voornaam='$firstname', Achternaam='$lastname', Tussenvoegsel='$insertion', Email='$email', Woonplaats='$residence', Straat='$street', Huisnummer='$houseNumber', Postcode='$zipcode', Telefoonnummer='$phoneNumber' WHERE Id='$id' ";
		$result_customer = $conn->prepare($sql_customer);
		$result_customer->execute();
		
		unset($_SESSION['meldingen']);
		header ('location: ../index.php?page=klanten.inc.php');
	}else{
		header ('location: ../index.php?page=klantWijzigen.inc.php&id=' . $id);
	} */
?>